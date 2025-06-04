import { hoursAgo } from '@/helpers/timeConverter';
import { AccessToken, api } from '@/constants';
import { useModelName, useStoredUser, useUnseenMessageActions } from '@/hooks/store.actions';
import axios from 'axios';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image';
import { CloudImage } from '@/helpers/getFullImageUrl';
import ClientButton from '../ui/btn';
import { sendFriendRequest } from '@/helpers/followerFlowHandler';
import { toast } from 'sonner';
import { User } from '@/types';
import { useSocket } from '@/hooks/webSocket';
import { NOTIFICATION } from "@repo/dto"
import { useClickOutSide } from '@/hooks/useClickOutside';
import SideNavButton from '../SideNavButtons/Button';
import { IoIosHeartEmpty } from 'react-icons/io';
import { Span } from 'next/dist/trace';


enum Notification_Type {
  FRIEND_REQUEST,
  MESSAGE,
  COMMENT,
  LIKE,
  FOLLOW,
}

export enum RESPONSE_TYPE {
  FOLLOW = "FOLLOW",
  UNFOLLOW = "UNFOLLOW"
}

const NotificationComp = () => {

  const [notifications, setNotifications] = useState<NOTIFICATION[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const modelName = useModelName();
  const { setModels } = useUnseenMessageActions();
  const isOpen = modelName === 'notification';
  //getting user from custom hook
  const user = useStoredUser();
  const socket = useSocket();

  //getting notifications
  useEffect(() => {

    const getNotifications = async () => {
      try {
        const res = await axios.get(`${api}/notification/${user.id}`, {
          headers: AccessToken(user.accessToken)
        });
        setNotifications(res.data)
        console.log(res.data)
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    getNotifications();

  }, [user])

  //real time notification
  useEffect(() => {
    if (!socket) return;

    socket.on("notification", (data) => {
      setNotifications((prev) => [...prev, data])
    });

    return () => { socket.off("notification") };

  }, [socket]);

  //seperating notification on time 
  const [weekNotifs, monthNotifs, earlierNotifs, unSeenNotifs] = useMemo(() => {

    //seperating notification on time 
    const week = [], month = [], earlier = [];

    for (const n of notifications) {
      const hrs = hoursAgo(n.createdAt);
      if (hrs < 169) week.push(n);
      else if (hrs < 5041) month.push(n);
      else earlier.push(n);
    }

    //counting unread notifications
    const unSeen =notifications.filter((n) => !n.isRead).map((n)=> n.id)

    return [week, month, earlier, unSeen];
  }, [notifications]);

  //Outside click handler
  useClickOutSide({
    ref: notificationRef,
    action: () => {
      if (isOpen) setModels('')
    }
  });

  //feedback to server for seen notifs
  useEffect(()=>{
    if(unSeenNotifs.length ==0 || !socket) return;

    else{
      
      socket.emit('sendNotificationAck',unSeenNotifs)
    }
  },[unSeenNotifs,socket])
  return (

    < div className='relative'
      ref={notificationRef}
    >
      {/* Side NAV ICON */}

      <SideNavButton
        Icon={IoIosHeartEmpty}
        size={28}
        content='Notification'
        onPress={() => {
          setModels(isOpen ? '' : 'notification')
        }}
      />

    { unSeenNotifs.length >0 && <span
    className='text-xs absolute bottom-0 left-[85%] bg-black text-gray-400'
    >
      {unSeenNotifs.length}
    </span> }
      
      {/* MAIN COMP */}

      <div style={{ width: modelName == "notification" ? 310 : 0 }} className='fixed top-0 left-18 xl:left-38 bottom-0 z-50 bg-black overflow-hidden pt-8 transition-all duration-500 shadow-md shadow-white'>
        <div className='w-full h-full z-50'>
          <h2 className='text-2xl font-bold ml-2'>Notifications</h2>

          <div className='flex flex-col w-full h-full text-sm'>

            {/*CURRENT WEEK NOTIFICATIONS */}
            {weekNotifs.length > 0 && (
              <>
                <p className='text-sm font-bold mt-4'>This week</p>
                {weekNotifs.map(n => (
                  <NotifiCationShower key={n.id} notification={n} user={user} />
                ))}
                <hr className='line' />
              </>
            )}

            {/*CURRENT MONTH NOTIFICATIONS */}
            {monthNotifs.length > 0 && (
              <>
                <p className='text-sm font-bold mt-2'>This month</p>
                {monthNotifs.map(n => (
                  <NotifiCationShower key={n.id} notification={n} user={user} />
                ))}
                <hr className='line' />
              </>
            )}

            {/*EARLIER NOTIFICATIONS */}
            {earlierNotifs.length > 0 && (
              <>
                <p className='text-sm font-bold mt-2'>Earlier</p>
                {earlierNotifs.map(n => (
                  <NotifiCationShower key={n.id} notification={n} user={user} />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div >

  )
}

export default NotificationComp;




const NotifiCationShower = React.memo(({ notification, user }: { notification: NOTIFICATION, user: User }) => {

  //Response to follower notifications
  const AddFriend = async ({ receiverId, type }: { receiverId: number, type: RESPONSE_TYPE }) => {

    if (!user.id || !user.accessToken) return;

    const { message, status } = await sendFriendRequest({ senderId: user.id, receiverId, accessToken: user.accessToken, request_type: type })

    if (status) {
      toast.success(message)
    }
    else {
      toast.error(message)
    }
  }

  return (
    <div className='px-2 flex flex-col'>

      <div className='flex flex-row w-full h-17 items-center'>
        <Image src={CloudImage(notification.sender.avatar) || "/person.webp"} height={10} width={10} alt='person-image' className='w-9 h-9 rounded-full border-1 border-gray-600 flex-shrink-0' />
        <p className='ml-2'>
          <span className='mr-2 font-bold'>
            {notification.sender.name}
          </span>
          <span>
            {notification.message}
            <span className='ml-1 text-gray-500'>
              {Math.ceil(hoursAgo(notification.createdAt) / 60)}d
            </span>
          </span>

          {/* Follow Back and Unfollow Button */}
          {notification.type == "FOLLOW" && (
            <span>
              {notification?.isOneWayFollow ?
                <ClientButton onPress={() => AddFriend({ type: RESPONSE_TYPE.FOLLOW, receiverId: notification.sender.id })} content="Follow Back" containerClass='ml-2 bg-blue-900/60 py-1 px-2 text-xs font-semibold rounded-md hover:bg-blue-800' />
                :
                <ClientButton onPress={() => AddFriend({ type: RESPONSE_TYPE.UNFOLLOW, receiverId: notification.sender.id })} content="Unfollow" containerClass='ml-2 bg-gray-800 py-1 px-2 text-xs font-semibold rounded-md hover:bg-gray-700' />
              }
            </span>
          )}
        </p>
      </div>
    </div>
  )
});