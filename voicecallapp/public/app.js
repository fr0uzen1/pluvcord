const startCallButton = document.getElementById('startCall');
const endCallButton = document.getElementById('endCall');
const audioElement = document.getElementById('audio');
const usernameInput = document.getElementById('username');
const participantsList = document.getElementById('participantsList');

let localStream;
let peerConnection;
let username = '';
const participants = new Set(); // Множество для хранения участников

const serverConfig = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302' // STUN-сервер для поиска публичных IP
    }
  ]
};

// Функция для обновления списка участников
function updateParticipantsList() {
  participantsList.innerHTML = ''; // Очищаем текущий список
  participants.forEach(participant => {
    const li = document.createElement('li');
    li.textContent = participant;
    participantsList.appendChild(li);
  });
}

// Функция для начала звонка
startCallButton.onclick = async () => {
  username = usernameInput.value.trim();
  if (!username) {
    alert('Пожалуйста, введите ваше имя');
    return;
  }

  participants.add(username);
  updateParticipantsList();

  startCallButton.disabled = true;
  endCallButton.disabled = false;

  try {
    // Запросить доступ к микрофону
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioElement.srcObject = localStream;

    // Создание peer-соединения
    peerConnection = new RTCPeerConnection(serverConfig);

    // Отправка локального потока на соединение
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    // Обработка получения удалённого потока
    peerConnection.ontrack = event => {
      audioElement.srcObject = event.streams[0];
    };

    // Обработка ICE кандидатов
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        // Отправить кандидата на сервер
      }
    };

    // Генерация offer для соединения
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // Отправить offer на сервер (для обмена через сервер)
    // Можно использовать WebSocket или другие методы для обмена сигналами
  } catch (error) {
    console.error('Ошибка при подключении к микрофону: ', error);
  }
};

// Функция для завершения звонка
endCallButton.onclick = () => {
  participants.delete(username); // Удаляем пользователя из списка
  updateParticipantsList();

  startCallButton.disabled = false;
  endCallButton.disabled = true;

  peerConnection.close();
  localStream.getTracks().forEach(track => track.stop());
  audioElement.srcObject = null;
};
