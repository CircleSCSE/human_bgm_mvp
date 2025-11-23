import React, { useState, useEffect } from 'react';
import { db, storage } from './firebase'; 
import { collection, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import './App.css'; 

function App() {
  const [musicList, setMusicList] = useState([]);

  // 1. 데이터 가져오기 (이 부분은 잘 되니까 그대로 유지)
  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "music"));
        
        const promises = querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          let fileName = data.file_name;
          
          if (fileName && !fileName.includes('.')) {
            fileName += '.mp3';
          }

          let audioUrl = "";
          try {
            const storageRef = ref(storage, `music/${fileName}`);
            audioUrl = await getDownloadURL(storageRef);
          } catch (err) {
            console.error("오디오 URL 에러:", fileName);
          }

          return {
            id: doc.id,
            ...data,
            realFileName: fileName, 
            audioUrl: audioUrl      
          };
        });

        const list = await Promise.all(promises);
        setMusicList(list);

      } catch (error) {
        console.error("데이터 가져오기 실패:", error);
      }
    };
    fetchMusic();
  }, []);

  // 2. 다운로드 핸들러 (복잡한 거 다 뺌 -> 무조건 새 창 열기)
  const handleDownload = async (musicItem) => {
    if (!musicItem.audioUrl) {
      alert("파일 주소를 찾을 수 없습니다.");
      return;
    }

    const isAgreed = window.confirm(
      `[출처 표기 약속]\n\n"${musicItem.source_text}"\n\n이 출처를 꼭 표기하겠습니까?`
    );

    if (isAgreed) {
      try {
        // 1. 카운트 증가
        const musicDocRef = doc(db, "music", musicItem.id);
        updateDoc(musicDocRef, {
          downloadCount: increment(1)
        }); // 기다리지 않고(await 없이) 바로 실행해서 딜레이 줄임

        // 2. 그냥 새 탭으로 열어버림 (제일 확실함)
        window.open(musicItem.audioUrl, '_blank');

        // 3. 안내 메시지
        alert("새 탭에서 음악이 열렸나요?\n\n[Command + S] (맥북)\n[Ctrl + S] (윈도우)\n\n를 누르면 저장됩니다!");

      } catch (error) {
        console.error("오류:", error);
        // 에러 나도 일단 열어줌
        window.open(musicItem.audioUrl, '_blank');
      }
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>HumanBGM (MVP)</h1>
        <p>AI가 아닌, '진짜 아티스트'의 음악.</p>
      </header>
      <main>
        {musicList.map(music => (
          <div key={music.id} className="music-item">
            <h2>{music.title}</h2>
            
            {/* 미리듣기 */}
            {music.audioUrl ? (
              <audio controls src={music.audioUrl}>
                 오디오 지원 안함
              </audio>
            ) : (
              <p style={{color:'red'}}>로딩 실패</p>
            )}

            {/* 다운로드 버튼 */}
            <div className="button-group">
              <button onClick={() => handleDownload(music)}>
                다운로드 (새 탭에서 열기)
              </button>
            </div>
            
            <p className="source-text">출처: {music.source_text}</p>
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;