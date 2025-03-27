import { useState } from "react";
import { FaEdit, FaSave } from "react-icons/fa";

const EditableCard = ({ title, fields, data, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(data);

  const handleEditToggle = async () => {
    if (isEditing) {
      await handleSave(formData); // ✅ Save to backend
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSave = async (updatedData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/students/${formData.rollNo}`, {  // ✅ Use formData.rollNo
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update student data");
      }

      const result = await response.json();
      console.log("Updated student:", result);
      onSave(result.student); // ✅ Update parent state
    } catch (error) {
      console.error("Error saving student data:", error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-5 mb-5">
      {/* Title & Edit Button */}
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button
          className="flex items-center bg-indigo-800 text-white px-3 py-1 rounded-lg"
          onClick={handleEditToggle}
        >
          {isEditing ? <><FaSave className="mr-2" /> Save</> : <><FaEdit className="mr-2" /> Edit</>}
        </button>
      </div>

      {/* Responsive Grid for Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col">
            <label className="text-gray-500 text-sm">{field.label}</label>
            {isEditing ? (
              <input
                type={field.type}
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(e, field.name)}
                className="border p-2 rounded-md"
              />
            ) : (
              <p className="font-medium">{formData[field.name] || "Not Available"}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditableCard;
