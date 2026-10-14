import CreatePost from "./CreatePost";
import PostGrid from "./PostGrid";
import { useProfileData } from "./getProfiledata";

export default function Notes() {
    const { data, isLoading, isError } = useProfileData();

    if (isLoading) {
        return (
            <div className="w-4/5 lg:w-3/5 m-4 min-h-[300px] flex items-center justify-center">
                <p className="text-gray-300">Loading your posts...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="w-4/5 lg:w-3/5 m-4 min-h-[300px] flex items-center justify-center">
                <p className="text-red-400">Failed to load your posts.</p>
            </div>
        );
    }

    return (
        <div className="w-4/5 lg:w-3/5 m-4 text-white">
            <CreatePost />
            <PostGrid posts={data?.posts ?? []} canDelete />
        </div>
    );
}
