// 상태 관리 라이브러리로 'zustand' 사용
import {create} from "zustand";
import axios from "axios";

const APPLICATION_SERVER_URL = 'https://mysquidcanvas.shop/';

const useStore = create((set) => ({
// 상태와 관련된 변수와 함수들을 정의 : create 함수
// 상태를 변경하는 함수(상태 갱신 시, 리액티브하게 컴포넌트 업데이트 됨) : set 함수

  gamers: [],
  setGamers: (gamer) => {
    set((state) => ({
      gamers: [...state.gamers, gamer],
    }));
  },
  deleteGamer: (name) => {
    set((state) => ({
      gamers: state.gamers.filter((a) => a.name !== name), /* a.name이 name과 같지 않은 것만 남김 */
    }));
  },
  clearGamer: () => {
    set((state) => ({
      gamers: [],
    }));
  },
  // JANG: playerCount를 Gamer 함수로 처리
  playerCount: 0,
  setPlayerCount: (playerCount) => { set({playerCount: playerCount}) },

  // 추가!
  curSession: undefined,
  setCurSession: (curSession) => { set({curSession: curSession}) },

  myUserId: undefined,
  setMyUserId: (myUserId) => { set({myUserId: myUserId}) },

  gameStart: false,
  setGameStart: (gameStart) => { set({gameStart: gameStart}) },

  gameEnd: false,
  setGameEnd: (gameEnd) => { set({gameEnd: gameEnd}) },
  // MRSEO:
  Phase: Ready,
  setReady: (Phase) => { set({Phase: Phase}) },

  curTurn: 1,
  setCurTurn: (curTurn) => { set({curTurn: curTurn}) },

  whoIsPainter: undefined,
  setWhoIsPainter: (whoIsPainter) => { set({whoIsPainter: whoIsPainter}) },

  redScoreCnt: 0,
  setRedScoreCnt: (redScoreCnt) => { set({redScoreCnt: redScoreCnt}) },

  blueScoreCnt: 0,
  setBlueScoreCnt: (blueScoreCnt) => { set({blueScoreCnt: blueScoreCnt}) },

}));

export default useStore;