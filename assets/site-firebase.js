import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { firebaseConfig } from "/assets/firebase-config.js";

const menu=document.querySelector(".menu-button"),nav=document.querySelector(".nav");
menu?.addEventListener("click",()=>nav?.classList.toggle("open"));
const esc=(v="")=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const fmt=v=>{const d=v?.toDate?v.toDate():new Date(v);return Number.isNaN(d.getTime())?"":new Intl.DateTimeFormat("ko-KR",{year:"numeric",month:"long",day:"numeric"}).format(d)};
function card(p){const images=Array.isArray(p.images)?p.images:[];const cover=p.cover||images[0]||"/assets/program-placeholder.jpg";return `<article class="program-card"><img src="${esc(cover)}" alt="${esc(p.title)} 활동 대표 사진" loading="lazy"><div class="program-body"><div class="program-meta"><span>${esc(p.category||"프로그램")}</span><time>${fmt(p.date)}</time></div><h3>${esc(p.title)}</h3><p>${esc(p.summary||"")}</p>${images.length>1?`<div class="gallery">${images.slice(1,4).map(x=>`<img src="${esc(x)}" alt="${esc(p.title)} 추가 활동 사진" loading="lazy">`).join("")}</div>`:""}</div></article>`}
async function loadPrograms(){
  try{
    const app=initializeApp(firebaseConfig),db=getFirestore(app);
    const snap=await getDocs(query(collection(db,"programs"),orderBy("date","desc"),limit(50)));
    const posts=snap.docs.map(d=>({id:d.id,...d.data()})).filter(p=>p.published!==false);
    const home=document.querySelector("#program-list"),all=document.querySelector("#program-all");
    if(home)home.innerHTML=posts.slice(0,6).map(card).join("")||"<p>등록된 활동 소식이 없습니다.</p>";
    if(all)all.innerHTML=posts.map(card).join("")||"<p>등록된 활동 소식이 없습니다.</p>";
  }catch(e){
    console.error(e);
    document.querySelectorAll("#program-list,#program-all").forEach(el=>el.innerHTML="<p>활동 소식을 불러오지 못했습니다. Firebase 설정을 확인해 주세요.</p>");
  }
}
loadPrograms();