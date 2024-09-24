import { LatestPost } from "~/app/_components/post";
import { getServerAuthSession } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
export default async function CreatePostPage() {
      const hello = await api.post.hello({ text: "Anshu garg" });
  const session = await getServerAuthSession();

  void api.post.getLatest.prefetch();
    return (
        <HydrateClient>
        <div>{hello.greeting}</div>
        <div>{session ? JSON.stringify(session) : "No session available"}</div>
    </HydrateClient>
    )
}