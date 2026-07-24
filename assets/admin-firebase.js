import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, Timestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";
import { firebaseConfig, ADMIN_EMAIL } from "/assets/firebase-config.js";

const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app),storage=getStorage(app),provider=new GoogleAuthProvider();
const $=id=>document.getElementById(id);
$("date").value=new Date().toISOString().slice(0,10);

$("login-button").onclick=async()=>{try{$("login-message").textContent="";const r=await signInWithPopup(auth,provider);if(r.user.email?.toLowerCase()!==ADMIN_EMAIL.toLowerCase()){await signOut(auth);throw new Error("등록된 관리자 Gmail 계정이 아닙니다.");}}catch(e){$("login-message").textContent=e.message}};
$("logout-button").onclick=()=>signOut(auth);

onAuthStateChanged(auth,user=>{
  const allowed=user&&user.email?.toLowerCase()===ADMIN_EMAIL.toLowerCase();
  $("login-view").classList.toggle("hidden",allowed);
  $("admin-view").classList.toggle("hidden",!allowed);
  if(allowed){$("user-info").textContent=user.email;loadRecent();}
});

$("images").addEventListener("change",e=>{
  const files=[...e.target.files].slice(0,10);$("preview").innerHTML="";
  for(const f of files){const img=document.createElement("img");img.src=URL.createObjectURL(f);img.alt="업로드 미리보기";$("preview").appendChild(img)}
});

async function uploadImage(file,folder,index,total){
  if(!file.type.startsWith("image/"))throw new Error("이미지 파일만 업로드할 수 있습니다.");
  if(file.size>10*1024*1024)throw new Error("사진 한 장은 10MB 이하여야 합니다.");
  const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"-");
  const path=`programs/${folder}/${Date.now()}-${index}-${safe}`;
  const task=uploadBytesResumable(ref(storage,path),file,{contentType:file.type});
  return new Promise((resolve,reject)=>task.on("state_changed",s=>{
    const individual=s.bytesTransferred/s.totalBytes;
    $("progress").value=Math.round(((index+individual)/total)*100);
  },reject,async()=>resolve(await getDownloadURL(task.snapshot.ref))));
}

$("post-form").addEventListener("submit",async e=>{
  e.preventDefault();
  const user=auth.currentUser;
  if(!user||user.email?.toLowerCase()!==ADMIN_EMAIL.toLowerCase())return;
  const files=[...$("images").files].slice(0,10);
  if(!files.length)return;
  const button=$("submit-button"),msg=$("form-message"),progress=$("progress");
  button.disabled=true;progress.classList.remove("hidden");msg.textContent="사진을 업로드하고 있습니다.";
  try{
    const slug=$("date").value+"-"+Date.now(),urls=[];
    for(let i=0;i<files.length;i++)urls.push(await uploadImage(files[i],slug,i,files.length));
    await addDoc(collection(db,"programs"),{
      title:$("title").value.trim(),category:$("category").value,
      summary:$("summary").value.trim(),content:$("content").value.trim(),
      date:Timestamp.fromDate(new Date($("date").value+"T09:00:00+09:00")),
      cover:urls[0],images:urls,published:true,
      createdAt:serverTimestamp(),createdBy:user.email
    });
    msg.textContent="게시가 완료되었습니다. 홈페이지에 즉시 반영됩니다.";
    e.target.reset();$("date").value=new Date().toISOString().slice(0,10);$("preview").innerHTML="";loadRecent();
  }catch(err){console.error(err);msg.textContent="오류: "+err.message}
  finally{button.disabled=false;progress.classList.add("hidden");progress.value=0}
});

async function loadRecent(){
  try{
    const snap=await getDocs(query(collection(db,"programs"),orderBy("date","desc"),limit(10)));
    $("recent-posts").innerHTML=snap.docs.map(d=>{const p=d.data(),date=p.date?.toDate?.();return `<article><img src="${p.cover||""}" alt=""><div><b>${p.title||""}</b><p>${date?date.toLocaleDateString("ko-KR"):""}</p></div></article>`}).join("")||"<p>등록된 게시물이 없습니다.</p>";
  }catch(e){$("recent-posts").innerHTML="<p>최근 게시물을 불러오지 못했습니다.</p>"}
}