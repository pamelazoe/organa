
let video = document.createElement("video");
let canvasElement = document.getElementById("canvas");
let canvas = canvasElement.getContext("2d");
let loadingMessage = document.getElementById("loadingMessage");
let outputContainer = document.getElementById("output");
let outputMessage = document.getElementById("outputMessage");
let outputData = document.getElementById("outputData");
let studentsList = [];
let database = null;


function drawLine(begin, end, color) {
  canvas.beginPath();
  canvas.moveTo(begin.x, begin.y);
  canvas.lineTo(end.x, end.y);
  canvas.lineWidth = 4;
  canvas.strokeStyle = color;
  canvas.stroke();
}

// Use facingMode: environment to attemt to get the front camera on phones
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
.then(function(stream) {
  video.srcObject = stream;
  video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
  video.play();

  requestAnimationFrame(tick);
})

document.body.onload = function loadAssistenceList(){
  const students = "https://laboratoria-la.firebaseapp.com/cohorts/gdl-2019-01-bc-core-gdl-002/users";
  fetch(students).then( response=>{
    return response.json();
  }).then( data =>{
    studentsList = data.filter(member => member.role === "student").map(student => student.name);
    console.log("DEBUG: array de asistencia", studentsList);
  }).catch(err => {
    console.log(err);
  });

  const firebaseConfig = {
    apiKey: "AIzaSyDM4BaGXqRrxEstoAWDB9J6_eUpl2vyHpc",
    authDomain: "organa-fe27f.firebaseapp.com",
    databaseURL: "https://organa-fe27f.firebaseio.com",
    projectId: "organa-fe27f",
    storageBucket: "organa-fe27f.appspot.com",
    messagingSenderId: "379976432430",
    appId: "1:379976432430:web:b799351a0821af9a"
  };

  firebase.initializeApp(firebaseConfig);
  database = firebase.firestore();

}

function getTodayDateStr() {
  const date = new Date();
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
}

function updateDbAsistence(studentName, db) {
  const todayDateStr = getTodayDateStr();

  let asistenceRef = db.collection("asistencia_gdl");
  let todayAsistenceRef = asistenceRef.doc(todayDateStr);

  todayAsistenceRef.get().then(doc=>{
    if (doc.exists) {
      let studentsList = doc.data().students;
      console.log("Document data:", studentsList);

      const studentFound = studentsList.find(student=>{
        return student.name === studentName;
      });

      if(studentFound === undefined) { /* student is not found in today's list */
        studentsList.push({ name: studentName, date: Date.now() });
        // adding student to asistence list
        todayAsistenceRef.set({
          students: studentsList
        }).catch(error => {
          console.error("Error writing document: ", error);
        });
    }
    } else {
      todayAsistenceRef.set({
        students: [{name:studentName, date: Date.now()}]
      });
    }
  }).catch(error=> {
    console.log("Error getting document:", error);
  });
}

function tick() {

  loadingMessage.innerText = "⌛ Loading video..."
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    loadingMessage.hidden = true;
    canvasElement.hidden = false;
    outputContainer.hidden = false;

    canvasElement.height = video.videoHeight;
    canvasElement.width = video.videoWidth;
    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
    let imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
    let code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    if (code) {
      drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
      drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
      drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
      drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
      outputMessage.hidden = true;
      outputData.parentElement.hidden = false;

      //outputData.innerText = "Bienvenida " + code.data  +" happy coding";
      let timerInterval
      Swal.fire({
      title: "Bienvenida " + dataName,
      html: " happy coding",
      timer: 2000,
      onBeforeOpen: () => {
      Swal.showLoading()
      timerInterval = setInterval(() => {
        Swal.getContent().querySelector('strong')
          .textContent = Swal.getTimerLeft()
      }, 100)
      },
      onClose: () => {
      clearInterval(timerInterval)
      }
      }).then((result) => {
      if (
      // Read more about handling dismissals
      result.dismiss === Swal.DismissReason.timer
      ) {
      console.log('I was closed by the timer')
      }
      })

      if (studentsList.includes(code.data)) {
          console.log(code.data + "es alumna");
          const studentName = code.data;
          updateDbAsistence(studentName, database);     
      }
      else{
        console.log(code.data + " NO es alumna");
      }

    } else {
      outputMessage.hidden = false;
      //outputData.parentElement.hidden = true;
    }

  }
  //video.stop(code.data);

//console.log(dataName);
<<<<<<< HEAD
  requestAnimationFrame(tick);
}
=======
  
  //requestAnimationFrame(tick);
}

setInterval(()=>{requestAnimationFrame(tick)}, 50);

(function main() {
  
})();
>>>>>>> f31c7d6e71cb45494269866ed0048d27a5a52050
