/* // Users.jsx
/* import CreateUserForm from "../features/users/CreateUserForm";
import useTeams from "../features/profiles/useTeams";
import { useProfiles } from "../features/profiles/useProfiles";
import useCreateUser from "../features/users/useCreateUsers"; 
import Spinner from "../ui/Spinner";

export default function Users() {
  const { profiles: users, isLoading } = useProfiles();
  const { teams, isLoading: isLoadingTeams } = useTeams(); // returns [{id,slug,name}, ...]
  const { createUser, isCreating } = useCreateUser();
  if (isLoading || isLoadingTeams || isCreating) return <Spinner />;
  return (
    <CreateUserForm
      existingUsers={users}
      currentUserRole="admin"
      currentUserTeams={["natural-cosmetics"]}
      teams={teams.map((t) => t.slug)} // or pass objects if your form expects them
      isSubmitting={isLoading || isCreating}
      onCreate={createUser} // pass the form payload directly
    />
  );
}
 */

import Row from "../ui/Row";
import Heading from "../ui/Heading";

function Users() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">Users</Heading>
      </Row>
    </>
  );
}
export default Users;
