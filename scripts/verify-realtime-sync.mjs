import Pusher from 'pusher';
import PusherClient from 'pusher-js';

const PUSHER_APP_ID = '2190587';
const PUSHER_KEY = 'c3033ba642dda6c25d10';
const PUSHER_SECRET = '3d67309adbf9c9bb602a';
const PUSHER_CLUSTER = 'ap1';

const pusherServer = new Pusher({
  appId: PUSHER_APP_ID,
  key: PUSHER_KEY,
  secret: PUSHER_SECRET,
  cluster: PUSHER_CLUSTER,
  useTLS: true,
});

async function runRealtimeVerification() {
  console.log('🧪 === RUNNING COMPREHENSIVE REAL-TIME TWO-WAY MULTIPLAYER VERIFICATION ===\n');

  const testChannelName = 'presence-public-sakura';

  // 1. Setup Client A (Chrome Simulation)
  const clientA = new PusherClient(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER,
    authorizer: (channel) => ({
      authorize: (socketId, callback) => {
        const authData = pusherServer.authorizeChannel(socketId, channel.name, {
          user_id: `user_chrome_${socketId}`,
          user_info: { username: 'Player_Chrome', catName: 'หนูหริ่ง' },
        });
        callback(null, authData);
      },
    }),
  });

  // 2. Setup Client B (Edge Simulation)
  const clientB = new PusherClient(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER,
    authorizer: (channel) => ({
      authorize: (socketId, callback) => {
        const authData = pusherServer.authorizeChannel(socketId, channel.name, {
          user_id: `user_edge_${socketId}`,
          user_info: { username: 'Player_Edge', catName: 'kuy' },
        });
        callback(null, authData);
      },
    }),
  });

  let clientA_saw_B_join = false;
  let clientB_saw_A_existing = false;
  let clientA_got_cat_data = false;
  let clientB_got_cat_data = false;

  await new Promise((resolve) => {
    const channelA = clientA.subscribe(testChannelName);

    channelA.bind('pusher:subscription_succeeded', (members) => {
      console.log(`✅ [Chrome / Client A] Subscribed successfully! (Current Members: ${members.count})`);

      // Now connect Client B (Edge)
      const channelB = clientB.subscribe(testChannelName);

      channelB.bind('pusher:subscription_succeeded', async (bMembers) => {
        console.log(`✅ [Edge / Client B] Subscribed successfully! (Members seen: ${bMembers.count})`);
        if (bMembers.count >= 2) {
          clientB_saw_A_existing = true;
        }

        // Client B broadcasts cat-joined
        try {
          await pusherServer.trigger(testChannelName, 'cat-joined', {
            senderId: `user_edge_${clientB.connection.socket_id}`,
            customization: { name: 'kuy', breed: 'orange_tabby', baseColor: '#ffa94d' },
            stats: { energy: 90 },
            isGreeting: true,
          });
        } catch (e) {
          console.error('Trigger B error:', e);
        }
      });

      channelA.bind('pusher:member_added', (member) => {
        console.log(`✅ [Chrome / Client A] Realtime 'pusher:member_added' detected! -> Member: ${member.id}`);
        clientA_saw_B_join = true;
      });

      channelA.bind('cat-joined', async (data) => {
        console.log(`✅ [Chrome / Client A] Received Cat Handshake -> Name: "${data.customization.name}", Breed: ${data.customization.breed}, Color: ${data.customization.baseColor}`);
        clientA_got_cat_data = true;

        // Reply back with Chrome's cat data
        try {
          await pusherServer.trigger(testChannelName, 'cat-joined', {
            senderId: `user_chrome_${clientA.connection.socket_id}`,
            customization: { name: 'หนูหริ่ง', breed: 'siamese', baseColor: '#805f3c' },
            stats: { energy: 95 },
            isGreeting: false,
          });
        } catch (e) {
          console.error('Trigger A error:', e);
        }
      });

      channelB.bind('cat-joined', (data) => {
        if (data.customization.name === 'หนูหริ่ง') {
          console.log(`✅ [Edge / Client B] Received Cat Handshake -> Name: "${data.customization.name}", Breed: ${data.customization.breed}, Color: ${data.customization.baseColor}`);
          clientB_got_cat_data = true;
        }
      });
    });

    // Check completion after 3.5 seconds
    setTimeout(async () => {
      try {
        const res = await pusherServer.get({ path: `/channels/${testChannelName}`, params: { info: 'user_count' } });
        const serverData = await res.json();
        console.log(`\n📡 [Pusher REST Server Status] Channel User Count: ${serverData.user_count}/20`);
      } catch (err) {}

      clientA.disconnect();
      clientB.disconnect();
      resolve(true);
    }, 3500);
  });

  console.log('\n==========================================');
  console.log(`📊 Client A (Chrome) saw Client B join: ${clientA_saw_B_join ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`📊 Client B (Edge) saw Client A in room: ${clientB_saw_A_existing ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`📊 Chrome got Edge cat skin ('kuy'): ${clientA_got_cat_data ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`📊 Edge got Chrome cat skin ('หนูหริ่ง'): ${clientB_got_cat_data ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('==========================================');

  if (clientA_saw_B_join && clientB_saw_A_existing && clientA_got_cat_data && clientB_got_cat_data) {
    console.log('\n🎉 ALL REAL-TIME MULTIPLAYER TESTS PASSED (100% SYNCHRONIZED)!');
  }
}

runRealtimeVerification().catch(console.error);
