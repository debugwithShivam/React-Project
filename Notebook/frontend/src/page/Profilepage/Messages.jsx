import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSelecUser } from "../../Redux/Slice";
import useConversations from "./useConversations";

const avatarColors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-cyan-500",
  "bg-indigo-500",
];

function formatTime(value) {
  if (!value) return "";

  const date = new Date(value);
  const now = new Date();
  const isSameDay = date.toDateString() === now.toDateString();

  if (isSameDay) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return date.toLocaleDateString([], { day: "2-digit", month: "short" });
}

export default function Messages() {
  const { data, isLoading, isError } = useConversations();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const conversations = data?.data ?? [];

  const openChat = (user) => {
    dispatch(setSelecUser(user));
    navigate("/ChatSeaction");
  };

  if (isLoading) {
    return (
      <div className="w-4/5 lg:w-3/5 m-4 h-80 flex items-center justify-center">
        <p className="text-gray-300">Loading conversations...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-4/5 lg:w-3/5 m-4 h-80 flex items-center justify-center">
        <p className="text-red-400">Failed to load conversations.</p>
      </div>
    );
  }

  return (
    <div className="w-4/5 lg:w-3/5 m-4 h-80 md:h-45 lg:h-88 overflow-y-auto scrollbar-thin">
      {conversations.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-400">No conversations yet.</p>
        </div>
      ) : (
        conversations.map((conversation, index) => (
          <div
            key={conversation.conversationId}
            onClick={() => openChat(conversation.user)}
            className="m-2 p-2 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-between gap-3 cursor-pointer hover:bg-white/35 transition"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-full border-2 border-white/30 text-xl font-semibold text-white ${avatarColors[index % avatarColors.length]}`}
              >
                {(conversation.user?.name || conversation.user?.username || "A")[0].toUpperCase()}
              </div>

              <div className="min-w-0">
                <h2 className="font-semibold truncate">{conversation.user?.name}</h2>
                <h3 className="text-sm text-gray-400 truncate">
                  {conversation.lastMessage?.content || "No messages yet"}
                </h3>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-xs text-gray-400">
                {formatTime(conversation.lastMessageAt || conversation.lastMessage?.createdAt)}
              </span>
              {conversation.unreadCount > 0 && (
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                  {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                </span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
