import { useState } from "react";
export default function CategorySearch({ category, setcategory }) {
  const [toggle, setoggle] = useState(false);
  const options = [
    {
      id: 1,
      label: "All Alerts",
    },
    {
      id: 2,
      label: "Medical",
    },
    {
      id: 3,
      label: "Fire",
    },
    {
      id: 4,
      label: "Crime",
    },
    {
      id: 5,
      label: "All Resources",
    },
    {
      id: 6,
      label: "Fire-Equipment",
    },
    {
      id: 7,
      label: "Medical-Equipment",
    },
    {
      id: 8,
      label: "Hospitals",
    },
  ];
  return (
    <div className="absolute top-2 left-3 z-40">
      {toggle ? (
        <>
          <button
            className="text-gray-700 bg-gray-100 hover:bg-gray-400 rounded-lg p-2 pl-4 py-2 mx-4 mt-4 w-50 font-semibold text-sm flex justify-start shadow"
            onClick={() => setoggle(!toggle)}
          >
            {category}
          </button>
          <div className="flex flex-col bg-gray-100 w-50 rounded shadow gap-1 pl-2 mx-4 divide-y divide-gray-300">
            {options.map((opt, index) => (
              <button
                key={index}
                className="text-gray-600 text-sm hover:bg-gray-400 w-full text-left px-3 py-2 rounded"
                onClick={() => {
                  setcategory(opt.label);
                  setoggle(!toggle);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <button
          className="text-gray-700 bg-gray-100 hover:bg-gray-400 rounded-lg text-sm font-semibold p-2 pl-4 pr-6 mx-4 mt-4 text-md flex justify-start shadow-lg"
          onClick={() => setoggle(!toggle)}
        >
          {category}
        </button>
      )}
    </div>
  );
}
