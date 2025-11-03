import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import CreateEmployeeForm from "./CreateEmployeeForm";

function AddEmployee() {
  return (
    <div>
      <Modal>
        <Modal.Open opens="employee-form">
          <Button type="button">Add employee</Button>
        </Modal.Open>

        <Modal.Window name="employee-form">
          <CreateEmployeeForm />
        </Modal.Window>
      </Modal>
    </div>
  );
}

export default AddEmployee;
