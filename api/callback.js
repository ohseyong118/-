function html(message){return `<!doctype html><html><body><script>
(function(){
  function receiveMessage(e){
    window.opener.postMessage(${json.dumps("MESSAGE")}.replace("MESSAGE", ${json.dumps("")}), e.origin);
  }
  window.addEventListener("message", function(e){
    window.opener.postMessage(${json.dumps("TOKEN_MESSAGE")}, e.origin);
  }, {once:true});
  window.opener.postMessage("authorizing:github", "*");
})();
</script></body></html>`.replace("TOKEN_MESSAGE", message.replace(/"/g,'&quot;'));}

export default {
  async fetch(request){
    const id=process.env.GITHUB_CLIENT_ID;
    const secret=process.env.GITHUB_CLIENT_SECRET;
    if(!id||!secret)return new Response("OAuth 환경변수가 없습니다.",{status:500});
    const u=new URL(request.url);
    const code=u.searchParams.get("code");
    const state=u.searchParams.get("state");
    const cookie=request.headers.get("cookie")||"";
    const saved=cookie.match(/(?:^|;\s*)oauth_state=([^;]+)/)?.[1];
    if(!code||!state||state!==saved){
      return new Response(html("authorization:github:error:로그인 확인 실패"),{headers:{"content-type":"text/html;charset=utf-8"}});
    }
    const r=await fetch("https://github.com/login/oauth/access_token",{
      method:"POST",
      headers:{accept:"application/json","content-type":"application/json"},
      body:JSON.stringify({client_id:id,client_secret:secret,code,redirect_uri:u.origin+"/api/callback"})
    });
    const d=await r.json();
    const message=d.access_token
      ? "authorization:github:success:"+JSON.stringify({token:d.access_token,provider:"github"})
      : "authorization:github:error:"+(d.error_description||"로그인 실패");
    const safe=JSON.stringify(message);
    const body=`<!doctype html><html><body><script>
    (function(){
      window.addEventListener("message",function(e){window.opener.postMessage(${safe},e.origin)},{once:true});
      window.opener.postMessage("authorizing:github","*");
    })();
    </script></body></html>`;
    return new Response(body,{headers:{"content-type":"text/html;charset=utf-8","set-cookie":"oauth_state=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax"}});
  }
};