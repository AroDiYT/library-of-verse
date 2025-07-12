'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface Table {
  name: string;
  columns: string[];
}

interface TableData {
  columns: string[];
  rows: any[];
}

export default function DatabaseAdminPage() {
  const { user, loading } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingRow, setEditingRow] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      redirect('/auth');
    }
  }, [user, loading]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchTables();
    }
  }, [user]);

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/admin/database/tables');
      if (response.ok) {
        const data = await response.json();
        setTables(data);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const fetchTableData = async (tableName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/database/table/${tableName}`);
      if (response.ok) {
        const data = await response.json();
        setTableData(data);
      }
    } catch (error) {
      console.error('Error fetching table data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    setTableData(null);
    setEditingRow(null);
    fetchTableData(tableName);
  };

  const handleEdit = (row: any) => {
    setEditingRow({ ...row });
  };

  const handleSave = async () => {
    if (!editingRow || !selectedTable) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/database/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table: selectedTable,
          data: editingRow,
        }),
      });

      if (response.ok) {
        setEditingRow(null);
        fetchTableData(selectedTable);
      } else {
        alert('Failed to update row');
      }
    } catch (error) {
      console.error('Error updating row:', error);
      alert('Error updating row');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (row: any) => {
    if (!confirm('Are you sure you want to delete this row?')) return;

    try {
      const response = await fetch('/api/admin/database/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table: selectedTable,
          id: row.id,
        }),
      });

      if (response.ok) {
        fetchTableData(selectedTable);
      } else {
        alert('Failed to delete row');
      }
    } catch (error) {
      console.error('Error deleting row:', error);
      alert('Error deleting row');
    }
  };

  const handleInputChange = (column: string, value: any) => {
    setEditingRow((prev: any) => ({
      ...prev,
      [column]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white font-display">Database Management</h1>
            <p className="text-gray-300 mt-2">View and edit database records</p>
          </div>
          <Link 
            href="/admin"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table Selector */}
          <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Tables</h2>
            <div className="space-y-2">
              {tables.map((table) => (
                <button
                  key={table.name}
                  onClick={() => handleTableSelect(table.name)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedTable === table.name
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {table.name}
                </button>
              ))}
            </div>
          </div>

          {/* Table Data */}
          <div className="lg:col-span-3">
            {selectedTable ? (
              <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">{selectedTable}</h2>
                  <div className="text-sm text-gray-400">
                    {tableData ? `${tableData.rows.length} rows` : ''}
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400"></div>
                  </div>
                ) : tableData && tableData.rows.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          {tableData.columns.map((column) => (
                            <th key={column} className="text-left py-3 px-2 text-gray-300 font-medium">
                              {column}
                            </th>
                          ))}
                          <th className="text-left py-3 px-2 text-gray-300 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.rows.map((row, index) => (
                          <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                            {tableData.columns.map((column) => (
                              <td key={column} className="py-3 px-2">
                                {editingRow && editingRow.id === row.id ? (
                                  <input
                                    type="text"
                                    value={editingRow[column] || ''}
                                    onChange={(e) => handleInputChange(column, e.target.value)}
                                    className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs"
                                  />
                                ) : (
                                  <span className="text-gray-300 text-xs">
                                    {row[column] !== null ? String(row[column]) : 'NULL'}
                                  </span>
                                )}
                              </td>
                            ))}
                            <td className="py-3 px-2">
                              {editingRow && editingRow.id === row.id ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleSave}
                                    disabled={isSubmitting}
                                    className="text-green-400 hover:text-green-300 text-xs"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingRow(null)}
                                    className="text-gray-400 hover:text-gray-300 text-xs"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEdit(row)}
                                    className="text-blue-400 hover:text-blue-300 text-xs"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(row)}
                                    className="text-red-400 hover:text-red-300 text-xs"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : tableData ? (
                  <div className="text-center py-12 text-gray-400">
                    No data found in this table
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
                <div className="text-center py-12 text-gray-400">
                  Select a table to view its contents
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Warning */}
        <div className="mt-8 bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Warning</span>
          </div>
          <p className="text-yellow-300 text-sm">
            You are directly editing the database. Changes are permanent and can affect the application's functionality. 
            Please be cautious and make sure you understand the impact of your changes.
          </p>
        </div>
      </div>
    </div>
  );
}
