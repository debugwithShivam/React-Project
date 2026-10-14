import { useState } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { Camera, X } from "lucide-react";
import VITE_API_URL from "../../config/backend_API_URL";
import { setUser } from "../../Redux/Slice";

export default function EditProfile({ user, onClose }) {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const [name, setName] = useState(user?.name || "");
    const [username, setUsername] = useState(user?.username || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [picture, setPicture] = useState(null);
    const [preview, setPreview] = useState(user?.profilePicture || "");

    const updateProfile = useMutation({
        mutationFn: async () => {
            const form = new FormData();
            form.append("name", name);
            form.append("username", username);
            form.append("bio", bio);
            if (picture) form.append("profilePicture", picture);

            const response = await axios.patch(
                `${VITE_API_URL}/authRouter/updateProfile`,
                form,
                { withCredentials: true }
            );
            return response.data;
        },
        onSuccess: (data) => {
            dispatch(setUser({ ...(user || {}), ...data.user }));
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            onClose();
        },
    });

    const error = updateProfile.error
        ? updateProfile.error.response?.data?.message ||
          updateProfile.error.response?.data?.error?.message ||
          "Could not save your profile."
        : "";
    function handlePictureChange(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        if (preview && preview.startsWith("blob:")) {
            URL.revokeObjectURL(preview);
        }
        setPicture(file);
        setPreview(URL.createObjectURL(file));
    }

    const initial = (name || username || "A")[0]?.toUpperCase();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    updateProfile.mutate();
                }}
                className="w-full max-w-md rounded-3xl bg-black/70 border border-white/10 p-6 text-white"
            >
                <div className="flex items-start justify-between">
                    <h2 className="text-xl font-bold">Edit profile</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="mt-5 flex items-center gap-4">
                    <div className="relative shrink-0">
                        {preview ? (
                            <img
                                src={preview}
                                alt=""
                                className="w-20 h-20 rounded-full object-cover ring-2 ring-white/20"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 ring-2 ring-white/20 flex items-center justify-center text-2xl font-semibold">
                                {initial}
                            </div>
                        )}
                        <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-indigo-500 hover:bg-indigo-400 flex items-center justify-center cursor-pointer border-2 border-black">
                            <Camera size={14} />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePictureChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                    <p className="text-sm text-white/50">
                        JPG or PNG, up to 5 MB.
                    </p>
                </div>

                <div className="mt-5 space-y-4">
                    <label className="block">
                        <span className="text-xs uppercase tracking-wide text-white/50">
                            Name
                        </span>
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="mt-1 w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                        />
                    </label>

                    <label className="block">
                        <span className="text-xs uppercase tracking-wide text-white/50">
                            Username
                        </span>
                        <input
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            className="mt-1 w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                        />
                    </label>

                    <label className="block">
                        <span className="text-xs uppercase tracking-wide text-white/50">
                            Bio
                        </span>
                        <textarea
                            value={bio}
                            rows={3}
                            maxLength={200}
                            onChange={(event) => setBio(event.target.value)}
                            placeholder="Tell people something about you"
                            className="mt-1 w-full resize-none rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                        />
                    </label>
                </div>

                {error && (
                    <p className="mt-3 text-sm text-red-300/80">{error}</p>
                )}

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={updateProfile.isPending}
                        className="px-5 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 text-sm font-semibold disabled:opacity-60"
                    >
                        {updateProfile.isPending ? "Saving..." : "Save changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
