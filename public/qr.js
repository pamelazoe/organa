let video = document.createElement("video");
  let canvasElement = document.getElementById("canvas");
  let canvas = canvasElement.getContext("2d");
  let loadingMessage = document.getElementById("loadingMessage");
  let outputContainer = document.getElementById("output");
  let outputMessage = document.getElementById("outputMessage");
  let outputData = document.getElementById("outputData");
  let viewStudent = document.querySelector(".view-student").style.display="block";
  let admin = document.querySelector(".admin-section").style.display="none";
  let totalAssist = document.querySelector(".total-assist");
  // let hello = document.getElementsByClassName("hello");


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
    console.log(asistenceRef);

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

      db.collection("asistencia_gdl").get().then(function(querySnapshot){
        querySnapshot.forEach(doc => {
           if (doc.id === getTodayDateStr()) {
            let assistence = doc.data().students.length;
            let dataList = 52;
            let delay = dataList - assistence;
            console.log(assistence);
            console.log(delay);

            // totalAssist.innerHTML = '';

            totalAssist.innerHTML += `

                  <p class="card-text">Hoy llegaron ${assistence} de 52</p>`}
        });

       })

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

        //outputData.innerText = code.data  +" happy coding";

        if (studentsList.includes(code.data)) {
            console.log(code.data + "es alumna");
            const studentName = code.data;
            updateDbAsistence(studentName, database);
            outputData.innerText = "Bienvenida " + code.data + "\n" + "Happy coding!";



          } else if (code.data=="abcdefg"){
          outputData.parentElement=code.data+"No es alumna";
          hide();
          // viewStudent.style.display ="none";
          //   admin.style.display ="block";
              // wrapper.style.display ="block";
          console.log(code.data + " NO es alumna");
        }

      } else {
        outputMessage.hidden = false;

      }

    }

  }

  setInterval(()=>{requestAnimationFrame(tick)}, 50);

  const hide = () => {
    let viewStudent = document.querySelector(".view-student").style.display="none";
  let admin = document.querySelector(".admin-section").style.display="block";
  }
