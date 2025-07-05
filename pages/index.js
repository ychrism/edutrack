/**
 * Page d'accueil - Tableau de bord principal
 * Vue d'ensemble avec statistiques et données récentes
 */
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import Toast, { toast } from '../components/Toast';
import { 
  Users, 
  GraduationCap, 
  Book, 
  ClipboardList,
  FileText,
  Mail,
  Edit,
  UserPlus,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    courses: 0,
    averageGrade: 0
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Récupération des statistiques
      const [studentsRes, gradesRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/grades')
      ]);

      const students = await studentsRes.json();
      const grades = await gradesRes.json();

      setStats({
        students: students.length,
        teachers: 18, // Valeur statique pour le moment
        courses: 32,
        averageGrade: grades.length > 0 ? (grades.reduce((sum, grade) => sum + grade.grade_value, 0) / grades.length).toFixed(1) : 0
      });

      setRecentStudents(students.slice(-5));
      setRecentGrades(grades.slice(0, 10));
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      name: 'Générer un bulletin',
      icon: FileText,
      color: 'bg-yellow-100 hover:bg-yellow-200',
      action: () => toast.success('Bulletin généré avec succès')
    },
    {
      name: 'Envoyer aux parents',
      icon: Mail,
      color: 'bg-green-100 hover:bg-green-200',
      action: () => toast.success('Message envoyé aux parents')
    },
    {
      name: 'Ajouter une note',
      icon: Edit,
      color: 'bg-purple-100 hover:bg-purple-200',
      action: () => toast.success('Nouvelle note ajoutée')
    },
    {
      name: 'Ajouter un élève',
      icon: UserPlus,
      color: 'bg-blue-100 hover:bg-blue-200',
      action: () => toast.success('Nouvel élève ajouté')
    }
  ];

  const upcomingEvents = [
    {
      title: 'Conseil de classe',
      date: 'Demain, 14h00',
      icon: AlertCircle,
      color: 'bg-red-100 text-red-500'
    },
    {
      title: 'Remise des bulletins',
      date: '15/10/2023',
      icon: Calendar,
      color: 'bg-blue-100 text-blue-500'
    },
    {
      title: 'Réunion parents-profs',
      date: '20/10/2023',
      icon: GraduationCap,
      color: 'bg-green-100 text-green-500'
    }
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Élèves inscrits"
            value={stats.students}
            change="+12% depuis le mois dernier"
            changeType="up"
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Enseignants"
            value={stats.teachers}
            change="Stable"
            changeType="neutral"
            icon={GraduationCap}
            color="purple"
          />
          <StatsCard
            title="Cours dispensés"
            value={stats.courses}
            change="+2 nouveaux cours"
            changeType="up"
            icon={Book}
            color="green"
          />
          <StatsCard
            title="Moyenne générale"
            value={`${stats.averageGrade}/20`}
            change="+0.5 depuis le trimestre dernier"
            changeType="up"
            icon={ClipboardList}
            color="yellow"
          />
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Élèves récents */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border-2 border-black">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-purple-800">Derniers élèves inscrits</h2>
              <a href="/students" className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                Voir tout
              </a>
            </div>

            <div className="space-y-4">
              {recentStudents.map((student) => (
                <div key={student.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {student.first_name} {student.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{student.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{student.class_name}</div>
                    <div className="text-sm text-gray-500">{student.enrollment_date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-black">
            <h2 className="text-xl font-bold text-purple-800 mb-6">Actions rapides</h2>

            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border-2 border-black transition-all duration-200 hover:transform hover:-translate-y-1 ${action.color}`}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-white bg-opacity-50 flex items-center justify-center mr-4">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{action.name}</span>
                    </div>
                    <span className="text-sm">→</span>
                  </button>
                );
              })}
            </div>

            {/* Prochaines échéances */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-purple-800 mb-4">Prochaines échéances</h3>
              <div className="space-y-3">
                {upcomingEvents.map((event, index) => {
                  const Icon = event.icon;
                  return (
                    <div key={index} className="flex items-start">
                      <div className={`flex-shrink-0 mt-1 w-8 h-8 rounded-full flex items-center justify-center ${event.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-500">{event.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Notes récentes */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-black">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-purple-800">Dernières notes ajoutées</h2>
            <a href="/grades" className="text-purple-600 hover:text-purple-800 text-sm font-medium">
              Voir tout
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Élève
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matière
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Note
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentGrades.slice(0, 5).map((grade) => (
                  <tr key={grade.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                          {grade.student_name?.split(' ').map(n => n.charAt(0)).join('')}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{grade.student_name}</div>
                          <div className="text-sm text-gray-500">{grade.class_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {grade.subject_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        grade.grade_value >= 16 ? 'bg-green-100 text-green-800' :
                        grade.grade_value >= 12 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {grade.grade_value}/{grade.max_grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(grade.date_recorded).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Toast />
    </Layout>
  );
}