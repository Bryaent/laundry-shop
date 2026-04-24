function addStudent(){

let name = document.getElementById("name").value;
let course = document.getElementById("course").value;

fetch("add.php",{

method:"POST",
headers:{
"Content-Type":"application/x-www-form-urlencoded"
},

body:"name="+name+"&course="+course

})
.then(res=>res.text())
.then(data=>{
alert(data);
loadStudents();
});

}

function loadStudents(){

fetch("list.php")
.then(res=>res.json())
.then(data=>{

let list = document.getElementById("list");
list.innerHTML="";

data.forEach(student => {

list.innerHTML += `<li>${student.name} - ${student.course}</li>`;

});

});

}

loadStudents();