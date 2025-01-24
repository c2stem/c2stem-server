const {ProjectClientBuilder} = require('syncflow-node-client');

module.exports =  {
  generateToken: async function (identity ) {
    const roomName = "SPICETestRoom";
    console.log('Requesting token:', { identity, roomName });
    const projectClient = new ProjectClientBuilder()
        .setServerUrl(process.env.SYNCFLOW_SERVER_URL)
        .setApiKey(process.env.SYNCFLOW_API_KEY)
        .setApiSecret(process.env.SYNCFLOW_API_SECRET)
        .setProjectId(process.env.SYNCFLOW_PROJECT_ID)
        .build();

    const jsonOkResponse = (res, data) => {
      return data;
    };

    const errorResponse = (res, error) => {
      return { error: error.message };
    };

    try {
      const isActive = (session) => {
        return session.status === 'Started';
      };

      const isRoom = (session) => {
        return session.name === roomName;
      };

      const existingSession = await (
          await projectClient.getSessions()
      ).mapAsync(async (sessions) => {
        const activeSessions = sessions.filter(isActive);
        const roomSessions = activeSessions.filter(isRoom);
        if (roomSessions.length > 0) {
          return roomSessions[0];
        }
      });

      const videoGrants = {
        canPublish: true,
        canPublishData: true,
        canPublishSources: ['camera', 'screen_share', 'microphone'],
        canSubscribe: true,
        canUpdateOwnMetadata: true,
        hidden: false,
        ingressAdmin: true,
        recorder: true,
        room: roomName,
        roomAdmin: true,
        roomCreate: true,
        roomJoin: true,
        roomList: true,
        roomRecord: true,
      };

      const tokenRequest = {
        identity,
        name: identity,
        videoGrants,
      };

      if (existingSession.value !== undefined) {
        return existingSession.mapAsync(async (session) => {
          console.log('Existing session', session.id);
          return (
              await projectClient.generateSessionToken(
                  session.id,
                  tokenRequest
              )
          ).unwrap();
              // .map((token) => jsonOkResponse(token))
              // .unwrap();
        });
      } else {
        console.log('Creating new session');
        // Create new session if none exists
        const newSessionRequest = {
          name: roomName,
          autoRecording: false,
          maxParticipants: 200,
          deviceGroups: [],
        };
        (await projectClient.createSession(newSessionRequest)).mapAsync(
            (session) => {
              console.log('Session', session.id);
              projectClient
                  .generateSessionToken(session.id, tokenRequest)
                  .then((token) => {
                    return jsonOkResponse(token.unwrap());
                  })
                  .catch((error) => {
                    return errorResponse(error);
                  });
            }
        );
      }
    } catch (error) {
      console.log('error', error);
      return errorResponse(error);
    }
  }
}

