import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Navega a la página anterior
  };

  return (
    <Button variant="secondary" onClick={handleBack}>
      Volver
    </Button>
  );
};

export default BackButton;
