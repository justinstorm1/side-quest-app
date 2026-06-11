import { NativeTabs } from 'expo-router/unstable-native-tabs'
import Onboarding from '@/components/Onboarding';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import JoinGroup from '@/components/JoinGroup';
import { BlurView } from 'expo-blur';

export default function TabsLayout() {
  const user = useQuery(api.users.currentUser);
  const group = useQuery(api.groups.getCurrentUserGroup);

  if (user === undefined) return null; // loading

  if (!user?.name || !user?.icon) {
    return <Onboarding />;
  } else if (!user.groupId) {
    return <JoinGroup />
  }
    
  return (
    <NativeTabs minimizeBehavior="onScrollDown" tintColor="#9179f5">
        <NativeTabs.Trigger name="(home)">
          <NativeTabs.Trigger.Icon sf="house.fill" md={"home"} />
            <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        {/* <NativeTabs.Trigger name="(rankings)">
          <NativeTabs.Trigger.Icon sf="chart.bar.fill" md={"bar_chart"} />
            <NativeTabs.Trigger.Label>Rankings</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger> */}
        <NativeTabs.Trigger name="(chats)">
          <NativeTabs.Trigger.Icon sf="message.fill" md={"message"} />
            <NativeTabs.Trigger.Label>Chats</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name='(group)'>
          <NativeTabs.Trigger.Icon sf='person.2.fill' md={'people'} />
          <NativeTabs.Trigger.Label>Group</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(profile)">
          <NativeTabs.Trigger.Icon sf="person.fill" md={"person"}/>
            <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        {/* <NativeTabs.Trigger name="(search)" role="search">
          <NativeTabs.Trigger.Icon sf="magnifyingglass" md={"search"} />
            <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger> */}
    </NativeTabs>
  )
}