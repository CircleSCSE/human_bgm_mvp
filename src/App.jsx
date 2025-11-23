import React, { useState, useEffect } from 'react';
import { db, storage } from './firebase'; 
import { collection, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import './App.css'; 

function App() {
  const [musicList, setMusicList] = useState([]);

  // 1. 데이터 가져오기
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

  // 2. 다운로드 핸들러
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
        const musicDocRef = doc(db, "music", musicItem.id);
        updateDoc(musicDocRef, {
          downloadCount: increment(1)
        });

        window.open(musicItem.audioUrl, '_blank');

        alert("새 탭에서 음악이 열렸나요?\n\n[Command + S] (맥북)\n[Ctrl + S] (윈도우)\n\n를 누르면 저장됩니다!");

      } catch (error) {
        console.error("오류:", error);
        window.open(musicItem.audioUrl, '_blank');
      }
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>🎵 HumanBGM</h1>
        <p>AI가 아닌, '진짜 아티스트'의 감성.</p>
        
        {/* 유튜브 링크 추가된 부분 */}
        <a 
          href="https://youtube.com/@circle.s448" 
          target="_blank" 
          rel="noopener noreferrer"
          className="youtube-link"
        >
          📺 Circle.S 유튜브 채널 방문하기
        </a>
      </header>
      
      <main>
        {musicList.map(music => (
          <div key={music.id} className="music-item">
            <h2>{music.title}</h2>
            
            {music.audioUrl ? (
              <audio controls src={music.audioUrl}>
                 오디오 지원 안함
              </audio>
            ) : (
              <p style={{color:'red'}}>로딩 실패</p>
            )}

            <div className="button-group">
              <button onClick={() => handleDownload(music)}>
                무료 다운로드 (Free Download)
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