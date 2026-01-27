import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateUser, uploadUserPhoto } from "../../services/users";
import { useUser } from "./useUser";

export function useUpdateUser() {
    const queryClient = useQueryClient();
    const { user } = useUser();

    const { mutate: updateUserFn, isPending: isUpdating } = useMutation({
        mutationFn: async ({
            fullName,
            avatar,
            firstName,
            lastName,
            phoneNumber,
            dateOfBirth,
        }: {
            fullName?: string;
            firstName?: string;
            lastName?: string;
            avatar?: File | null;
            phoneNumber?: string;
            dateOfBirth?: string;
        }) => {
            if (!user?.id) throw new Error("User not authenticated");

            // 1. Update text fields
            let fName = firstName;
            let lName = lastName;

            // Split fullName if provided and firstName/lastName aren't
            if (fullName && (!fName || !lName)) {
                const parts = fullName.split(" ");
                fName = parts[0];
                lName = parts.slice(1).join(" ") || "";
            }

            await updateUser(user.id, {
                first_name: fName,
                last_name: lName,
                phone_number: phoneNumber,
                date_of_birth: dateOfBirth,
            });

            // 2. Upload avatar if provided
            if (avatar) {
                // Convert to base64
                const fileToBase64 = (file: File): Promise<string> => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = () => {
                            const result = reader.result as string;
                            // remove prefix
                            const base64 = result.split(",")[1];
                            resolve(base64);
                        };
                        reader.onerror = (error) => reject(error);
                    });
                };

                const base64 = await fileToBase64(avatar);
                await uploadUserPhoto(user.id, base64, avatar.name);
            }
        },
        onSuccess: () => {
            toast.success("Compte mis à jour avec succès");
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
        onError: (err: any) => {
            toast.error(err.message || "Erreur lors de la mise à jour");
        },
    });

    return { updateUser: updateUserFn, isUpdating };
}
