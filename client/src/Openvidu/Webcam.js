import React, { useState, useEffect } from 'react';
import './Webcam.css';
import axios from 'axios';

// OpenVidu
import { OpenVidu } from 'openvidu-browser';
import UserVideoComponent from './UserVideoComponent';

// Zustand
import useStore from '../store';

// Bootstrap-react
import Button from 'react-bootstrap/Button';

// GamePlay
import GamePlay from '../Game/GamePlay';

// ★ TODO: 서버 url 변경 필요
const APPLICATION_SERVER_URL = "https://mysquidcanvas.shop/"
// const APPLICATION_SERVER_URL = process.env.NODE_ENV === 'production' ? '' : 'https://demos.openvidu.io/';

const Webcam = () => {
  const [mySessionId, setMySessionId] = useState('SessionA');
  const [myUserName, setMyUserName] = useState('Participant' + Math.floor(Math.random() * 100));
  const [session, setSession] = useState(undefined);
  const [publisher, setPublisher] = useState(undefined);
  const [subscribers, setSubscribers] = useState([]);

  useEffect(() => {

    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, []);

  const onBeforeUnload = (event) => {
    leaveSession();
  };

  const handleChangeSessionId = (e) => {
    setMySessionId(e.target.value);
  };

  const handleChangeUserName = (e) => {
    setMyUserName(e.target.value);
  };

  const joinSession = async(e) => {
    e.preventDefault();

    const OV = new OpenVidu();

    const mySession = OV.initSession();

    mySession.on('streamCreated', (event) => {
      var subscriber = mySession.subscribe(event.stream, undefined); 
      // mySession.subscribe : openvidu 세션(mySession)에 대해 스트림 구독
     
      var subscribers = [...subscribers];

      const addSubscriber = (subscriber, subscribers) => {
        subscribers.push(subscriber);
        useStore.getState().setGamers({
          name: JSON.parse(event.stream.connection.data).clientData,
          streamManager: subscriber,
          // MRSEO:
          drawable: false,
          canSeeAns: false,
        });
        return subscribers;
      };
      
      setSubscribers(addSubscriber(subscriber, subscribers));
    });

    mySession.on("streamDestroyed", (event) => {
      var subscribers = [...subscribers];

      const deleteSubscriber = (streamManager, subscribers) => {
        let index = subscribers.indexOf(streamManager, 0);
        
        useStore.getState().deleteGamer(JSON.parse(event.stream.connection.data).clientData);
        
        useStore.getState().setPlayerCount(useStore.getState().gamers.length);
        if (index > -1) {
          subscribers.splice(index, 1);
          return subscribers;
        }
      };

      setSubscribers(deleteSubscriber(event.stream.streamManager, subscribers));
    });

    mySession.on('exception', (exception) => {
      console.warn(exception);
    });

    try{
        const token = await getToken();
        await mySession.connect(token, { clientData: myUserName })
        .then(async () => {
            let publisher = await OV.initPublisherAsync(undefined, {
              audioSource: undefined,
              videoSource: undefined,
              publishAudio: true,
              publishVideo: true,
              resolution: '640x480',
              frameRate: 30,
              insertMode: 'APPEND',
              mirror: false,
            });
  
            mySession.publish(publisher);
  
            useStore.getState().setGamers({
              name: myUserName,
              streamManager: publisher,
            });
  
            // useStore.getState().setMyUserID(myUserName);
            setPublisher(publisher);
          })
    }
    catch (error) {
      console.log('There was an error connecting to the session:', error.code, error.message);
    }

    setSession(mySession);

  };

  const leaveSession = () => {
    const mySession = session;

    if (mySession) {
      mySession.disconnect();
    }

    useStore.getState().clearGamer();

    setSession(undefined);
    setSubscribers([]);
    setMySessionId('SessionA');
    setMyUserName('Participant' + Math.floor(Math.random() * 100));
    setPublisher(undefined);

  };

  const handleGameStart = () => {
    // 4명이 다 찼을 때만 실행 가능하게끔!
    useStore.getState().setGameStart(true);
  };

  const getToken = async () => {
    const sessionId = await createSession(mySessionId);
    console.log('getToken' + sessionId);
    return await createToken(sessionId);
  };

  const createSession = async (sessionId) => {
    console.log('create' + sessionId);
    const response = await axios.post(APPLICATION_SERVER_URL + 'api/sessions', { customSessionId: sessionId }, {
      headers: { 'Content-Type': 'application/json', },
    });
    return response.data; // The sessionId
  };

  const createToken = async (sessionId) => {
    console.log('createToken' + sessionId);
    const response = await axios.post(APPLICATION_SERVER_URL + 'api/sessions/' + sessionId + '/connections', {}, {
      headers: { 'Content-Type': 'application/json', },
    });
    return response.data; // The token
  };

  return (

    <div className="Wrapper">

      {session === undefined ? (
        
        <div className="1_JoinForm">

            <div className="1_JoinForm_Header">
                <img src="resources/images/main-card.jpeg" alt="logo" />
            </div>

                <h1> 게임 참가 </h1>

                <form className="1_JoinForm_Body" onSubmit={joinSession}>
                    <p>
                        <label>Participant: </label>
                        <input
                            className="1_JoinForm_Input"
                            type="text"
                            id="userName"
                            value={myUserName}
                            onChange={handleChangeUserName}
                            required
                        />
                    </p>
                    <p>
                        <label> Session: </label>
                        <input
                            className="1_JoinForm_Input"
                            type="text"
                            id="sessionId"
                            value={mySessionId}
                            onChange={handleChangeSessionId}
                            required
                        />
                    </p>
                    <div className="1_JoinForm_Button">
                        <input name="commit" type="submit" value="JOIN" />
                    </div>
                </form>
        </div>

        ) : null}

        {session !== undefined ? (
            <>
            {useStore.getState().gameStart === false ? (
              // JANG: 게임 대기방으로 만들기!
                <div className="2_GameForm">

                    <div className="2_GameForm_Header">

                        <div className="2_GameForm_Button">
                            <Button
                            className="2_GameForm_Button_1"
                            onClick={leaveSession}
                            value="Exit"
                            >
                            Exit
                            </Button>

                            {/* Start 버튼은 4명이 다 차면 뜨도록 변경! */}
                            <Button
                            type="submit"
                            className="2_GameForm_Button_2"
                            onClick={handleGameStart}
                            >
                            Start
                            </Button>
                        </div>

                    </div>

                    <div className="2_GameForm_Body">
                      {/* JANG: 게임 진행 창*/}
                      <GamePlay />
                    </div>

                </div>
                ) : null }

                {/* JANG: 게임 끝난 창..? */}
                {useStore.getState().gameStart === true && useStore.getState().gameEnd === false ? (
                  
                  <div className="3_GameForm_Body">
                      {/* useStore.getState().gameStart -> false이면, 캔버스 lock 걸고
                          useStore.getState().gameStart -> true이면, 캔버스 lokc 풀기 + 게임 시작
                      */}

                  </div>
              ):null}
          </>
          ) : null}
    </div>

    )
}

export default Webcam;
