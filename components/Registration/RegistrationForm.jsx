import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import { Upload } from 'lucide-react';

export default function RegistrationForm() {
  const router = useRouter(); // Initialize the router for navigation
  const [formData, setFormData] = useState({
    name: 'Sarah Williams',
    age: '26',
    phoneNumber: '1234567890', // Example phone number
    password: '', // Add password field
    bloodGroup: 'B+',
    allergies: 'None',
    medicalConditions: 'Asthma',
    medications: 'Atorvastatin, Albuterol, Metformin, Lisinopril',
    emergencyContactName: 'Brian Williams',
    emergencyContactPhone: '9876543210', // Example emergency contact phone number
    previousExperience: false,
    experienceTypes: {
      cpr: false,
      fireResponse: false,
      disasterRelief: false,
      firstAid: false
    },
    formalTraining: false,
    certificates: [],
    availability: 'always',
    hasSmartDevice: false,
    termsAccepted: false
  });

  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name.startsWith('experienceTypes.')) {
        const experienceType = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          experienceTypes: {
            ...prev.experienceTypes,
            [experienceType]: checked
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      certificates: [...prev.certificates, ...files]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <img
            src="/reach_logo.png"
            className="mx-auto h-24 w-24 mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900">R.E.A.C.H</h1>
          <p className="text-xl text-gray-600">Rapid Emergency Action for Community Help</p>
          <p className="mt-2 italic text-gray-600">
            "No matter your skills, there's always a way to help. Let's make a difference together."
          </p>

          {/* Back Button */}
          <div className="absolute top-4 left-4">
            <button
              type="button"
              onClick={() => router.back()} // Navigate to the previous page
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Back
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="age">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 py-2 text-sm text-gray-600 focus:outline-none"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Medical Information (Optional)</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bloodGroup">
                  Blood Group
                </label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="allergies">
                  Allergies
                </label>
                <input
                  type="text"
                  id="allergies"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="medicalConditions">
                  Known Medical Conditions
                </label>
                <input
                  type="text"
                  id="medicalConditions"
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="medications">
                  Medications
                </label>
                <input
                  type="text"
                  id="medications"
                  name="medications"
                  value={formData.medications}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Emergency Contact Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="emergencyContactName">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  id="emergencyContactName"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="emergencyContactPhone">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Experience and Training */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Experience and Training</h2>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="previousExperience"
                    checked={formData.previousExperience}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Do you have any previous experience in handling emergencies?</span>
                </label>
              </div>

              {formData.previousExperience && (
                <div className="ml-6 space-y-3">
                  <p className="text-gray-700 font-medium">What type of emergencies have you handled before?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="experienceTypes.cpr"
                        checked={formData.experienceTypes.cpr}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">CPR</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="experienceTypes.fireResponse"
                        checked={formData.experienceTypes.fireResponse}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">Fire Response</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="experienceTypes.disasterRelief"
                        checked={formData.experienceTypes.disasterRelief}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">Disaster Relief</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="experienceTypes.firstAid"
                        checked={formData.experienceTypes.firstAid}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">First Aid</span>
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="formalTraining"
                    checked={formData.formalTraining}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Have you received any formal training in emergency response?</span>
                </label>
              </div>

              {formData.formalTraining && (
                <div className="ml-6 space-y-3">
                  <p className="text-gray-700 font-medium">Please Attach Certificates</p>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                      <Upload className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">Add Documents</span>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </label>
                    {formData.certificates.length > 0 && (
                      <span className="text-sm text-gray-600">
                        {formData.certificates.length} file(s) selected
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Availability</h2>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="availability"
                  value="always"
                  checked={formData.availability === 'always'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-gray-700">Always available</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="availability"
                  value="specific"
                  checked={formData.availability === 'specific'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-gray-700">During specific hours</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="availability"
                  value="critical"
                  checked={formData.availability === 'critical'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-gray-700">Only during critical emergencies</span>
              </label>
            </div>
          </div>

          {/* Smart Device */}
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="hasSmartDevice"
                checked={formData.hasSmartDevice}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">Do you own a smartwatch or other smart devices with SOS Features?</span>
            </label>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
              />
              <span className="text-gray-700">
                By signing up, I agree to the Terms and Conditions and Privacy Policy.
              </span>
            </label>
          </div>



          {/* Submit Button */}
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              disabled={!formData.termsAccepted}
            >
              Submit and Start Volunteering
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}