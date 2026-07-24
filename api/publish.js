const OWNER="ohseyong118";
const REPO="-";
const BRANCH="main";

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=utf-8"}})}
async function gh(path,options={}) {
  const token=process.env.GITHUB_TOKEN;
  if(!token)throw new Error("Vercel GITHUB_TOKEN 환경변수가 없습니다.");
  const res=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,{
    ...options,
    headers:{
      "accept":"application/vnd.github+json",
      "authorization":`Bearer ${token}`,
      "x-github-api-version":"2022-11-28",
      "content-type":"application/json",
      ...(options.headers||{})
    }
  });
  if(!res.ok){const t=await res.text();throw new Error(`GitHub API ${res.status}: ${t}`)}
  return res.json();
}
async function verifyFirebaseToken(idToken){
  const projectId="ohseyong-2bb57";
  const res=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyDYiT45pncWemrk6dM3ExSWCL5-HaWJbgQ`,{
    method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({idToken})
  });
  if(!res.ok)throw new Error("Firebase 로그인 확인에 실패했습니다.");
  const data=await res.json();
  const email=data.users?.[0]?.email?.toLowerCase();
  if(email!==process.env.ADMIN_EMAIL?.toLowerCase())throw new Error("관리자 계정이 아닙니다.");
  return email;
}
async function putFile(path,base64,message){
  let sha;
  try{sha=(await gh(path)).sha}catch(e){if(!String(e.message).includes("404"))throw e}
  return gh(path,{method:"PUT",body:JSON.stringify({message,content:base64,branch:BRANCH,...(sha?{sha}:{})})});
}
export default {
  async fetch(request){
    if(request.method!=="POST")return json({error:"Method not allowed"},405);
    try{
      const auth=request.headers.get("authorization")||"";
      const idToken=auth.startsWith("Bearer ")?auth.slice(7):"";
      if(!idToken)return json({error:"로그인이 필요합니다."},401);
      await verifyFirebaseToken(idToken);

      const body=await request.json();
      const {date,category,title,summary,content,images}=body;
      if(!date||!title||!summary||!Array.isArray(images)||!images.length)return json({error:"필수 항목이 없습니다."},400);
      if(images.length>8)return json({error:"사진은 최대 8장입니다."},400);

      const slug=`${date}-${Date.now()}`;
      const urls=[];
      for(let i=0;i<images.length;i++){
        const path=`uploads/programs/${slug}-${i+1}.jpg`;
        await putFile(path,images[i].base64,`Add program photo: ${title}`);
        urls.push(`/${path}`);
      }

      let existing={programs:[]},sha;
      try{
        const file=await gh("data/programs.json");
        sha=file.sha;
        const raw=atob(file.content.replace(/\n/g,""));
        existing=JSON.parse(decodeURIComponent(escape(raw)));
      }catch(e){if(!String(e.message).includes("404"))throw e}

      existing.programs=Array.isArray(existing.programs)?existing.programs:[];
      existing.programs.push({published:true,date,category,title,summary,content,cover:urls[0],images:urls});
      const text=JSON.stringify(existing,null,2);
      const base64=btoa(unescape(encodeURIComponent(text)));

      await gh("data/programs.json",{method:"PUT",body:JSON.stringify({
        message:`Publish program: ${title}`,
        content:base64,
        branch:BRANCH,
        ...(sha?{sha}:{})
      })});

      return json({ok:true,urls});
    }catch(e){
      console.error(e);
      return json({error:e.message||"서버 오류"},500);
    }
  }
};
