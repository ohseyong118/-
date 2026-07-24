import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, getIdToken } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { firebaseConfig, ADMIN_EMAIL } from "/assets/firebase-config.js";

const app=initializeApp(firebaseConfig);
const auth=getAuth(app);
const provider=new GoogleAuthProvider();
const $=id=>document.getElementById(id);
$("date").value=new Date().toISOString().slice(0,10);

$("loginBtn").onclick=async()=>{
  $("loginMsg").textContent="";
  try{
    const result=await signInWithPopup(auth,provider);
    if(result.user.email?.toLowerCase()!==ADMIN_EMAIL.toLowerCase()){
      await signOut(auth);
      throw new Error("등록된 관리자 Gmail 계정이 아닙니다.");
    }
  }catch(e){$("loginMsg").textContent=e.message}
};
$("logoutBtn").onclick=()=>signOut(auth);

onAuthStateChanged(auth,user=>{
  const ok=user&&user.email?.toLowerCase()===ADMIN_EMAIL.toLowerCase();
  $("login").classList.toggle("hidden",ok);
  $("panel").classList.toggle("hidden",!ok);
  if(ok){$("userEmail").textContent=user.email;loadRecent();}
});

async function compress(file,max=1600,quality=.82){
  const bitmap=await createImageBitmap(file);
  let {width,height}=bitmap;
  const scale=Math.min(1,max/Math.max(width,height));
  width=Math.round(width*scale);height=Math.round(height*scale);
  const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
  canvas.getContext("2d").drawImage(bitmap,0,0,width,height);
  return new Promise(resolve=>canvas.toBlob(resolve,"image/jpeg",quality));
}

$("photos").addEventListener("change",e=>{
  const files=[...e.target.files].slice(0,8);
  $("preview").innerHTML="";
  files.forEach(f=>{const img=document.createElement("img");img.src=URL.createObjectURL(f);$("preview").appendChild(img)});
});

$("postForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const user=auth.currentUser;
  if(!user)return;
  const files=[...$("photos").files].slice(0,8);
  if(!files.length)return;

  const btn=$("publishBtn"),status=$("status"),progress=$("progress");
  btn.disabled=true;progress.classList.remove("hidden");status.className="msg";status.textContent="사진을 준비하고 있습니다.";

  try{
    const encoded=[];
    for(let i=0;i<files.length;i++){
      const blob=await compress(files[i]);
      const buffer=await blob.arrayBuffer();
      let binary="";const bytes=new Uint8Array(buffer);const chunk=0x8000;
      for(let j=0;j<bytes.length;j+=chunk)binary+=String.fromCharCode(...bytes.subarray(j,j+chunk));
      encoded.push({name:`photo-${i+1}.jpg`,base64:btoa(binary)});
      progress.value=Math.round(((i+1)/files.length)*45);
    }
    status.textContent="GitHub에 사진과 글을 저장하고 있습니다.";
    const token=await getIdToken(user,true);
    const res=await fetch("/api/publish",{
      method:"POST",
      headers:{"content-type":"application/json","authorization":`Bearer ${token}`},
      body:JSON.stringify({
        date:$("date").value,
        category:$("category").value,
        title:$("title").value.trim(),
        summary:$("summary").value.trim(),
        content:$("content").value.trim(),
        images:encoded
      })
    });
    const data=await res.json();
    if(!res.ok)throw new Error(data.error||"게시 실패");
    progress.value=100;
    status.className="msg success";
    status.textContent="게시가 완료되었습니다. 1~3분 후 홈페이지에 반영됩니다.";
    e.target.reset();$("date").value=new Date().toISOString().slice(0,10);$("preview").innerHTML="";
    loadRecent();
  }catch(err){
    console.error(err);
    status.className="msg error";
    status.textContent="오류: "+err.message;
  }finally{
    btn.disabled=false;
    setTimeout(()=>progress.classList.add("hidden"),1200);
  }
});

async function loadRecent(){
  try{
    const res=await fetch("/data/programs.json",{cache:"no-store"});
    const data=await res.json();
    const posts=(data.programs||[]).slice().reverse().slice(0,8);
    $("recent").innerHTML=posts.map(p=>`<article class="recent-item"><img src="${p.cover||""}" alt=""><div><b>${p.title}</b><small>${p.date} · ${p.category}</small></div></article>`).join("")||"<p>등록된 게시물이 없습니다.</p>";
  }catch{$("recent").innerHTML="<p>최근 게시물을 불러오지 못했습니다.</p>";}
}
