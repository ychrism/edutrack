/**
 * Page de gestion des paramètres
 * Configuration des informations de l'école, de l'année académique, des notes, et d'autres paramètres système
 */
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';
import Toast, { toast } from '../../components/Toast';

export default function Settings() {
  const { data: session } = useSession();
  
  // State for school info
  const [schoolInfo, setSchoolInfo] = useState({
    school_name: '',
    address: '',
    phone: '',
    email: ''
  });

  // State for academic year
  const [academicYear, setAcademicYear] = useState({
    start_date: '',
    end_date: ''
  });

  // State for grading system
  const [gradingSystem, setGradingSystem] = useState({
    passing_grade: 10
  });

  const handleSchoolInfoSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Call to API to update school info
      const response = await fetch('/api/settings/school-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schoolInfo),
      });

      if (response.ok) {
        toast.success('Informations de l\'école mises à jour avec succès');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleAcademicYearSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Call to API to update academic year
      const response = await fetch('/api/settings/academic-year', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(academicYear),
      });

      if (response.ok) {
        toast.success('Année académique mise à jour avec succès');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleGradingSystemSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Call to API to update grading system
      const response = await fetch('/api/settings/grading-system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gradingSystem),
      });

      if (response.ok) {
        toast.success('Système de notation mis à jour avec succès');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-purple-800">Paramètres</h1>
        <p className="text-gray-600">Modifiez les informations de l'école, configurez l'année académique, et ajustez le système de notation.</p>

        {/* School Information */}
        <section className="bg-white p-6 rounded-xl shadow-md border-2 border-black">
          <h2 className="text-2xl font-bold mb-4">Informations de l'école</h2>
          <form onSubmit={handleSchoolInfoSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'école
              </label>
              <input
                type="text"
                value={schoolInfo.school_name}
                onChange={(e) => setSchoolInfo({...schoolInfo, school_name: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                type="text"
                value={schoolInfo.address}
                onChange={(e) => setSchoolInfo({...schoolInfo, address: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={schoolInfo.phone}
                onChange={(e) => setSchoolInfo({...schoolInfo, phone: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={schoolInfo.email}
                onChange={(e) => setSchoolInfo({...schoolInfo, email: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg hover:from-pink-600 hover:to-orange-600 transition-all duration-200"
              >
                Mettre à jour
              </button>
            </div>
          </form>
        </section>

        {/* Academic Year */}
        <section className="bg-white p-6 rounded-xl shadow-md border-2 border-black">
          <h2 className="text-2xl font-bold mb-4">Année académique</h2>
          <form onSubmit={handleAcademicYearSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={academicYear.start_date}
                onChange={(e) => setAcademicYear({...academicYear, start_date: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={academicYear.end_date}
                onChange={(e) => setAcademicYear({...academicYear, end_date: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg hover:from-pink-600 hover:to-orange-600 transition-all duration-200"
              >
                Mettre à jour
              </button>
            </div>
          </form>
        </section>

        {/* Grading System */}
        <section className="bg-white p-6 rounded-xl shadow-md border-2 border-black">
          <h2 className="text-2xl font-bold mb-4">Système de notation</h2>
          <form onSubmit={handleGradingSystemSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note de passage
              </label>
              <input
                type="number"
                value={gradingSystem.passing_grade}
                onChange={(e) => setGradingSystem({...gradingSystem, passing_grade: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                min="0"
                max="20"
                step="0.01"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg hover:from-pink-600 hover:to-orange-600 transition-all duration-200"
              >
                Mettre à jour
              </button>
            </div>
          </form>
        </section>

      </div>

      <Toast />
    </Layout>
  );
}
