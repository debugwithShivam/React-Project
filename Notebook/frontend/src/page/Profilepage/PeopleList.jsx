import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Eye, UserRoundCheck, UserRoundPlus } from "lucide-react";
import useFollowStatus from "./useFollowStatus";
import useFollowMutation from "./useFollowMutation";

function PersonRow({ person }) {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.state);

    const {
        data: isFollowing = false,
        isLoading: statusLoading,
    } = useFollowStatus(person?._id);

    const { followMutation, unfollowMutation } = useFollowMutation();

    const isSelfRow = String(user?.id ?? user?._id) === String(person?._id);
    const isPending = followMutation.isPending || unfollowMutation.isPending;
    const initial = (person?.name || person?.username || "A")[0]?.toUpperCase();

    function handleToggle() {
        if (isFollowing) {
            unfollowMutation.mutate(person._id);
        } else {
            followMutation.mutate(person._id);
        }
    }

    return (
        <div className="m-2 flex items-center justify-between gap-3 rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
            <div className="flex min-w-0 items-center gap-3">
                {person?.profilePicture ? (
                    <img
                        src={person.profilePicture}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-full border-2 border-white/30 object-cover"
                    />
                ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-semibold">
                        {initial}
                    </div>
                )}

                <div className="min-w-0">
                    <h2 className="truncate font-semibold">{person?.name}</h2>
                    <h3 className="truncate text-sm text-white/45">
                        {person?.username}
                    </h3>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <button
                    type="button"
                    onClick={() => navigate(`/UserProfile/${person._id}`)}
                    aria-label="View profile"
                    className="flex h-10 items-center gap-1.5 rounded-full bg-white/10 px-3 text-sm font-medium hover:bg-white/20"
                >
                    <Eye size={16} />
                    View
                </button>

                {!isSelfRow && (
                    <button
                        type="button"
                        onClick={handleToggle}
                        disabled={statusLoading || isPending}
                        aria-label={isFollowing ? "Unfollow" : "Follow"}
                        className={`flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition ${
                            isFollowing
                                ? "border border-white/15 bg-white/10 hover:bg-white/20"
                                : "bg-[linear-gradient(117deg,rgba(129,125,250,1)_0%,rgba(28,21,214,1)_100%)] hover:opacity-90"
                        } disabled:opacity-60`}
                    >
                        {isFollowing ? <UserRoundCheck size={16} /> : <UserRoundPlus size={16} />}
                        {statusLoading || isPending
                            ? "..."
                            : isFollowing
                                ? "Following"
                                : "Follow"}
                    </button>
                )}
            </div>
        </div>
    );
}

export default function PeopleList({ people = [], emptyText = "Nobody here yet." }) {
    if (people.length === 0) {
        return (
            <p className="py-12 text-center text-sm text-white/50">{emptyText}</p>
        );
    }

    return (
        <div className="pb-4">
            {people.map((person) => (
                <PersonRow key={person?._id} person={person} />
            ))}
        </div>
    );
}
