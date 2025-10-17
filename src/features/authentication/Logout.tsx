import { HiOutlineArrowRightOnRectangle } from "react-icons/hi2";
/* import { useLogout } from "./useLogout"; */
/* import SpinnerMini from "../../ui/SpinnerMini"; */
import ButtonIcon from "../../ui/ButtonIcon";

function Logout() {
  /* const { logout, isLoading } = useLogout(); */

  return (
    <ButtonIcon disabled={true} onClick={() => {}}>
      <HiOutlineArrowRightOnRectangle />
      {/*  {false ? <SpinnerMini /> : <HiOutlineArrowRightOnRectangle />} */}
    </ButtonIcon>
  );
}

export default Logout;
