import React, { useState, useEffect } from 'react';
import { db, storage } from './firebase'; 
import { collection, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import './App.css'; 

function App() {
  const [musicList, setMusicList] = useState([]);

  // 1. Firestore에서 음악 목록 가져오기
  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "music"));
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("가져온 데이터:", list); // 콘솔에서 데이터 확인용
        setMusicList(list);
      } catch (error) {
        console.error("데이터 가져오기 실패:", error);
      }
    };
    fetchMusic();
  }, []);

  // 2. 다운로드 핸들러
  const handleDownload = async (musicItem) => {
    // 2-1. 출처 표기 약속 (DB 필드명 source_text로 수정됨)
    const isAgreed = window.confirm(
      `[출처 표기 약속]\n\n아래 출처를 영상 설명란에 꼭 표기해주세요.\n\n"${musicItem.source_text}"\n\n약속하십니까?`
    );

    if (isAgreed) {
      try {
        // 2-2. 다운로드 수 증가
        const musicDocRef = doc(db, "music", musicItem.id);
        await updateDoc(musicDocRef, {
          downloadCount: increment(1)
        });

        // 2-3. Storage URL 가져오기 
        // (주의: DB에 '.mp3'가 없으면 코드가 알아서 붙여주도록 수정함)
        let fileName = musicItem.file_name;
        if (!fileName.includes('.')) {
          fileName += '.mp3'; // 확장자가 없으면 .mp3를 붙여라!
        }
        
        const storageRef = ref(storage, `music/${fileName}`);
        const url = await getDownloadURL(storageRef);

        // 2-4. 진짜 다운로드 실행
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      } catch (error) {
        console.error("다운로드 오류 상세:", error);
        alert("파일을 찾을 수 없습니다. (콘솔 확인 필요)");
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
            
            {/* 오디오 플레이어 (DB 필드명 file_name 사용) */}
            <audio controls>
               {/* 주의: 이 부분은 배포 후 CORS 문제로 재생 안 될 수도 있지만, 다운로드는 될 겁니다 */}
               <source src={`https://firebasestorage.googleapis.com/v0/b/human-bgm-mvp.appspot.com/o/music%2F${music.file_name}.mp3?alt=media`} type="audio/mpeg" />
            </audio>

            <button onClick={() => handleDownload(music)}>
              다운로드
            </button>
            
            {/* DB 필드명 source_text로 수정됨 */}
            <p className="source-text">출처: {music.source_text}</p>
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;