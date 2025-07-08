/**
 * Page de gestion des notes
 * Liste, recherche, ajout et gestion des notes des étudiants
 */
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';
import Toast, { toast } from '../../components/Toast';
import { Search, Plus, Edit, Trash2, Filter } from 'lucide-react';

export default function Grades() {
  const { data: session } = useSession();
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    grade_value: '',
    max_grade: 20,
    grade_type: 'exam',
    comment: ''
  });

  useEffect(() => {
    fetchGrades();
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await fetch('/api/grades');
      const data = await response.json();
      setGrades(data);
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
      toast.error('Erreur lors du chargement des notes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingGrade ? `/api/grades/${editingGrade.id}` : '/api/grades';
      const method = editingGrade ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingGrade ? 'Note modifiée avec succès' : 'Note ajoutée avec succès');
        setShowAddModal(false);
        setEditingGrade(null);
        resetForm();
        fetchGrades();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erreur lors de l\'opération');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      toast.error('Erreur lors de l\'opération');
    }
  };

  const handleDelete = async (gradeId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) return;

    try {
      const response = await fetch(`/api/grades/${gradeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Note supprimée avec succès');
        fetchGrades();
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      course_id: '',
      grade_value: '',
      max_grade: 20,
      grade_type: 'exam',
      comment: ''
    });
  };

  const startEdit = (grade) => {
    setEditingGrade(grade);
    setFormData({
      student_id: grade.student_id || '',
      course_id: grade.course_id || '',
      grade_value: grade.grade_value || '',
      max_grade: grade.max_grade || 20,
      grade_type: grade.grade_type || 'exam',
      comment: grade.comment || ''
    });
    setShowAddModal(true);
  };

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = `${grade.student_name} ${grade.course_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === '' || grade.course_id == selectedCourse;
    const matchesStudent = selectedStudent === '' || grade.student_id == selectedStudent;
    return matchesSearch && matchesCourse && matchesStudent;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-purple-800">Gestion des notes</h1>
            <p className="text-gray-600">Gérez les notes des étudiants</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-lg border-2 border-black font-medium hover:from-pink-600 hover:to-orange-600 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            <Plus className="w-5 h-5" />
            Ajouter une note
          </button>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-black">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une note..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="pl-10 pr-8 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Tous les cours</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.subject_name} - {course.class_name}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="pl-10 pr-8 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Tous les étudiants</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>{student.first_name} {student.last_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Liste des notes */}
        <div className="bg-white rounded-xl shadow-md border-2 border-black overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des notes...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Étudiant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type d'évaluation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commentaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGrades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {grade.student_name}
                        </div>
                        <div className="text-xs text-gray-500">{grade.student_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{grade.course_name}</div>
                        <div className="text-xs text-gray-500">{grade.subject_name} - {grade.class_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {grade.grade_value}/{grade.max_grade}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {grade.grade_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {grade.comment}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(grade)}
                            className="text-purple-600 hover:text-purple-900 p-1 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(grade.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'ajout/édition */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-black">
            <h2 className="text-xl font-bold text-purple-800 mb-4">
              {editingGrade ? 'Modifier la note' : 'Ajouter une note'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Étudiant *
                </label>
                <select
                  value={formData.student_id}
                  onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner un étudiant</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.first_name} {student.last_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cours *
                </label>
                <select
                  value={formData.course_id}
                  onChange={(e) => setFormData({...formData, course_id: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner un cours</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.subject_name} - {course.class_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note *
                  </label>
                  <input
                    type="number"
                    value={formData.grade_value}
                    onChange={(e) => setFormData({...formData, grade_value: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    min="0"
                    max="20"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note maximale *
                  </label>
                  <input
                    type="number"
                    value={formData.max_grade}
                    onChange={(e) => setFormData({...formData, max_grade: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    min="1"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'évaluation *
                </label>
                <select
                  value={formData.grade_type}
                  onChange={(e) => setFormData({...formData, grade_type: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="exam">Examen</option>
                  <option value="assignment">Devoir</option>
                  <option value="quiz">Quiz</option>
                  <option value="project">Projet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commentaire
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="3"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingGrade(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg hover:from-pink-600 hover:to-orange-600 transition-all duration-200"
                >
                  {editingGrade ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast />
    </Layout>
  );
}
