import { useState } from "react";
import PartStateSidebar from "./PartStateSidebar";
import PartsByState from "./PartsByState";

const PartStateDashboard = () => {
  const [selectedState, setSelectedState] = useState(null);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-8rem)] bg-gray-100 pt-16">
      <div className="w-full md:w-80 min-[1040px]:w-[28rem] flex-shrink-0 bg-white border-r border-gray-200 sticky top-16 h-auto md:h-[calc(100vh-8rem)]">
        <div className="flex justify-center">
          <div className="w-full max-w-xs md:max-w-full">
            <PartStateSidebar
              onStateSelect={setSelectedState}
              selectedState={selectedState}
            />
          </div>
        </div>
      </div>
      <div className="flex-grow p-4">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl lg:max-w-[40rem]">
            {selectedState ? (
              <PartsByState state={selectedState} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-lg">
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
