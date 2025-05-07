import { useState } from "react";
import PartStateSidebar from "./PartStateSidebar";
import PartsByState from "./PartsByState";

const PartStateDashboard = () => {
  const [selectedState, setSelectedState] = useState(null);

  return (
    <div className="flex flex-col md:flex-row max-h-[calc(100vh-5rem)] bg-gray-100 mt-20 overflow-hidden">
      <div className="w-full md:w-80 min-[1040px]:w-[28rem] flex-shrink-0 bg-white border-r border-gray-200">
        <div className="flex justify-center h-full">
          <div className="w-full max-w-xs md:max-w-full h-full">
            <PartStateSidebar
              onStateSelect={setSelectedState}
              selectedState={selectedState}
            />
          </div>
        </div>
      </div>
      <div className="flex-grow px-2 md:px-4 py-2 h-full">
        <div className="flex justify-center h-full">
          <div className="w-full max-w-5xl xl:max-w-[60rem] min-[1300px]:max-w-[70rem] h-full">
            {selectedState ? (
              <PartsByState state={selectedState} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-lg pt-80">
                  Selecciona un estado para ver las piezas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartStateDashboard;
