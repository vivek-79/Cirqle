import { hoursAgo } from '@/helpers/timeConverter';
import { AccessToken, api } from '@/constants';
import { useStoredUser } from '@/hooks/store.actions';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import React, { useEffect, useState } from 'react'
import HighlightedBackground from '../HighlightedBackground';
import Image from 'next/image';
import { CloudImage } from '@/helpers/getFullImageUrl';
import ClientButton from '../ui/btn';
import { sendFriendRequest } from '@/helpers/followerFlowHandler';
import { toast } from 'sonner';
import { User } from '@/types';


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
interface Notification {
  message: string,
  isRead: boolean,
  createdAt: string,
  type: Notification_Type,
  sender: {
    avatar: string,
    name: string,
    id: number
  },
  isOneWayFollow?: boolean
}

const Notification = () => {

  const [notifications, setNotifications] = useState<Notification[]>([])
  //getting user from custom hook
  const user = useStoredUser();

  //getting notifications
  useEffect(() => {

    const getNotifications = async () => {
      try {
        const res = await axios.get(`${api}/notification/${user.id}`, {
          headers: AccessToken(user.accessToken)
        });
        setNotifications(res.data)
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    getNotifications();
  }, [user])

  console.log(notifications)

  const weekNotifs = notifications.filter(n => hoursAgo(n.createdAt) < 169);
  const monthNotifs = notifications.filter(n => hoursAgo(n.createdAt) >= 169 && hoursAgo(n.createdAt) < 5041);
  const earlierNotifs = notifications.filter(n => hoursAgo(n.createdAt) >= 5041);
  return (
    <div className='w-full h-full z-50'>
      <h2 className='text-2xl font-bold ml-2'>Notifications</h2>

      <div className='flex flex-col w-full h-full text-sm'>

        {/*CURRENT WEEK NOTIFICATIONS */}
        {weekNotifs.length > 0 && (
          <>
            <p className='text-sm font-bold mt-4'>This week</p>
            {weekNotifs.map(n => (
              <NotifiCationShower key={n.createdAt} notification={n} user={user} />
            ))}
            <hr className='line' />
          </>
        )}

        {/*CURRENT MONTH NOTIFICATIONS */}
        {monthNotifs.length > 0 && (
          <>
            <p className='text-sm font-bold mt-2'>This month</p>
            {monthNotifs.map(n => (
              <NotifiCationShower key={n.createdAt} notification={n} user={user} />
            ))}
            <hr className='line' />
          </>
        )}

        {/*EARLIER NOTIFICATIONS */}
        {earlierNotifs.length > 0 && (
          <>
            <p className='text-sm font-bold mt-2'>Earlier</p>
            {earlierNotifs.map(n => (
              <NotifiCationShower key={n.createdAt} notification={n} user={user} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default Notification;




const NotifiCationShower = ({ notification, user }: { notification: Notification, user: User }) => {

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

          <span>
            {notification?.isOneWayFollow ?
              <ClientButton onPress={() => AddFriend({ type: RESPONSE_TYPE.FOLLOW, receiverId: notification.sender.id })} content="Follow Back" containerClass='ml-2 bg-blue-900/60 py-1 px-2 text-xs font-semibold rounded-md hover:bg-blue-800' />
              :
              <ClientButton onPress={() => AddFriend({ type: RESPONSE_TYPE.UNFOLLOW, receiverId: notification.sender.id })} content="Unfollow" containerClass='ml-2 bg-gray-800 py-1 px-2 text-xs font-semibold rounded-md hover:bg-gray-700' />
            }
          </span>
        </p>
      </div>
    </div>
  )
}