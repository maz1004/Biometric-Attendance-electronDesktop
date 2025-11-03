import styled from "styled-components";
import Button from "../../ui/Button";

const Bar = styled.div`
  background: var(--color-toolbar-bg);
  border: 1px solid var(--color-toolbar-border);
  border-radius: var(--border-radius-md);
  padding: 1rem 1.2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const Left = styled.div`
  display: grid;
  gap: 2px;
`;

const Title = styled.div`
  font-weight: 700;
  color: var(--color-text-strong);
  line-height: 1.2;
`;

const WeekText = styled.div`
  color: var(--color-text-dim);
  font-size: 1.25rem;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

export default function PlanningHeaderBar(props: {
  weekISO: string;
  onPrev: () => void;
  onNext: () => void;
  onCopyWeek: () => void;
  onAddShift: () => void;
  onAddTeam: () => void;
}) {
  return (
    <Bar>
      <Left>
        <Title>Planning</Title>
        <WeekText>Week of {props.weekISO}</WeekText>
      </Left>

      <Right>
        <Button onClick={props.onPrev} variation="secondary" size="small">
          Prev
        </Button>
        <Button onClick={props.onNext} variation="secondary" size="small">
          Next
        </Button>
        <Button onClick={props.onCopyWeek} variation="secondary" size="small">
          Copy to next week
        </Button>
        <Button onClick={props.onAddTeam} size="small">
          Add team
        </Button>
        <Button onClick={props.onAddShift} size="small">
          Add shift
        </Button>
      </Right>
    </Bar>
  );
}
