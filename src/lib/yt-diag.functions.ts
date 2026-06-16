import { createServerFn } from "@tanstack/react-start";

const API = "https://www.googleapis.com/youtube/v3";

export const ytDiag = createServerFn({ method: "GET" }).handler(async () => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return { error: "no key" };

  const sampleId = "OLAK5uy_k06vYXqJjUr1u7QY50KgfuYGVBzR1CDrM";

  // 1. Get the channel that owns this OLAK playlist (the Topic channel).
  const plRes = await fetch(
    `${API}/playlists?part=snippet,contentDetails&id=${sampleId}&key=${apiKey}`,
  );
  const plJson = await plRes.json();
  const item = plJson?.items?.[0];
  const topicChannelId = item?.snippet?.channelId;
  const topicTitle = item?.snippet?.channelTitle;

  if (!topicChannelId) {
    return { step: "playlist", status: plRes.status, plJson };
  }

  // 2. List that channel's playlists (should be all the OLAK albums).
  const listRes = await fetch(
    `${API}/playlists?part=snippet&channelId=${topicChannelId}&maxResults=50&key=${apiKey}`,
  );
  const listJson = await listRes.json();
  const titles = (listJson?.items ?? []).map(
    (p: { id: string; snippet?: { title?: string } }) => `${p.id} :: ${p.snippet?.title}`,
  );

  return {
    topicChannelId,
    topicTitle,
    totalResults: listJson?.pageInfo?.totalResults,
    count: titles.length,
    nextPage: !!listJson?.nextPageToken,
    titles,
  };
});
