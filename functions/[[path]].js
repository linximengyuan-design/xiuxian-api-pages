const ORIGIN = "https://suyx.cc";

export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);

  if (url.pathname === "/") {
    return new Response("API proxy online", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }

  if (
    url.pathname !== "/version.json" &&
    !url.pathname.startsWith("/game-api/")
  ) {
    return new Response("Not Found", { status: 404 });
  }

  const upstream = new URL(url.pathname + url.search, ORIGIN);
  const headers = new Headers(request.headers);

  headers.delete("host");
  headers.delete("content-length");

  const init = {
    method: request.method,
    headers,
    redirect: "manual"
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }

  try {
    const response = await fetch(new Request(upstream, init));
    const responseHeaders = new Headers(response.headers);

    responseHeaders.set("Cache-Control", "no-store");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: "上游接口连接失败"
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      }
    );
  }
}
