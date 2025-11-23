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
        setMusicList(list);
      } catch (error) {
        console.error("데이터 가져오기 실패:", error);
      }
    };
    fetchMusic();
  }, []);

  // 2. 다운로드 핸들러 (업그레이드 버전)
  const handleDownload = async (musicItem) => {
    const isAgreed = window.confirm(
      `[출처 표기 약속]\n\n아래 출처를 영상 설명란에 꼭 표기해주세요.\n\n"${musicItem.source_text}"\n\n약속하십니까?`
    );

    if (isAgreed) {
      try {
        // 2-1. 다운로드 수 증가
        const musicDocRef = doc(db, "music", musicItem.id);
        await updateDoc(musicDocRef, {
          downloadCount: increment(1)
        });

        // 2-2. 파일 URL 및 이름 준비
        let fileName = musicItem.file_name;
        if (!fileName.includes('.')) {
          fileName += '.mp3';
        }
        const storageRef = ref(storage, `music/${musicItem.file_name}`);
        const url = await getDownloadURL(storageRef);

        // 2-3. [핵심] 강제 다운로드 시도 (Fetch -> Blob)
        // 브라우저가 재생해버리는 걸 막기 위해, 데이터를 덩어리(Blob)로 받아옵니다.
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
          
        } catch (corsError) {
          // 만약 보안(CORS) 문제로 강제 다운로드가 막히면 -> 새 탭으로 열어줌 (플랜 B)
          console.warn("CORS 보안으로 인해 새 탭에서 엽니다.", corsError);
          const newWindow = window.open(url, '_blank');
          if (newWindow) {
            alert("보안 설정 때문에 자동 다운로드가 차단되었습니다.\n새 탭이 열리면 [Command + S]를 눌러 저장해주세요!");
          }
        }

      } catch (error) {
        console.error("다운로드 로직 오류:", error);
        alert("다운로드 중 문제가 발생했습니다.");
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
            <audio controls>
               <source src={`https://firebasestorage.googleapis.com/v0/b/human-bgm-mvp.appspot.com/o/music%2F${music.file_name}.mp3?alt=media`} type="audio/mpeg" />
               브라우저가 오디오 태그를 지원하지 않습니다.
            </audio>
            <button onClick={() => handleDownload(music)}>
              다운로드
            </button>
            <p className="source-text">출처: {music.source_text}</p>
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;