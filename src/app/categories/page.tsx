"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  ChevronRight,
  FolderTree,
  X,
  Trash2,
  Edit2,
  AlertTriangle
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabase";
import type { Category, Subcategory } from "@/lib/types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatName, setSelectedCatName] = useState("Clothing");
  const [subcategories, setSubcategories] = useState<{ [key: string]: any[] }>({});
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newDisplayOrder, setNewDisplayOrder] = useState(1);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCat, setDeletingCat] = useState<Category | null>(null);

  // Subcategory State
  const [newSubName, setNewSubName] = useState("");
  const [newSubDisplayOrder, setNewSubDisplayOrder] = useState(1);
  const [editingSub, setEditingSub] = useState<any>(null);
  const [isEditSubModalOpen, setIsEditSubModalOpen] = useState(false);
  const [editSubName, setEditSubName] = useState("");
  const [editSubDisplayOrder, setEditSubDisplayOrder] = useState(0);
  
  // Validation Errors
  const [catError, setCatError] = useState<string | null>(null);
  const [subError, setSubError] = useState<string | null>(null);
  const [editSubError, setEditSubError] = useState<string | null>(null);


  const fetchCategories = async () => {
    const { data: cats } = await supabase.from('categories').select('*').order('display_order', { ascending: true });
    const { data: subs } = await supabase.from('subcategories').select('*').order('display_order', { ascending: true });
    const { data: products } = await supabase.from('products').select('category, subcategory');
    
    if (cats) {
      // Calculate counts from products
      const categoryCounts: Record<string, number> = {};
      const subcategoryCounts: Record<string, number> = {};
      
      products?.forEach(p => {
        if (p.category) {
          categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
        }
        if (p.subcategory) {
          subcategoryCounts[p.subcategory] = (subcategoryCounts[p.subcategory] || 0) + 1;
        }
      });

      const updatedCats = cats.map(cat => ({
        ...cat,
        count: categoryCounts[cat.name] || 0
      }));

      setCategories(updatedCats);
      
      if (subs) {
        const updatedSubs = subs.map(sub => ({
          ...sub,
          count: subcategoryCounts[sub.name] || 0
        }));

        const structured: { [key: string]: any[] } = {};
        updatedCats.forEach(cat => {
          const rootSubs = updatedSubs.filter(s => s.category_id === cat.id && !s.parent_id);
          structured[cat.name] = rootSubs;
        });
        setSubcategories(structured);
      }

      if (updatedCats.length > 0 && !updatedCats.find(c => c.name === selectedCatName)) {
        setSelectedCatName(updatedCats[0].name);
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCatId(null);
    setNewName("");
    setNewDisplayOrder(categories.length + 1);
    setCatError(null);
    setIsAddModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, cat: Category) => {
    e.stopPropagation();
    setEditingCatId(cat.id);
    setNewName(cat.name);
    setNewDisplayOrder(cat.display_order || 0);
    setCatError(null);
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, cat: Category) => {
    e.stopPropagation();
    setDeletingCat(cat);
    setIsDeleteModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!newName) return;
    
    if (newDisplayOrder < 1) {
      setCatError("Display order must be 1 or greater.");
      return;
    }

    if (editingCatId) {
      // Check for duplicate display order (excluding self)
      const isDuplicate = categories.some(c => c.display_order === newDisplayOrder && c.id !== editingCatId);
      if (isDuplicate) {
        setCatError(`Display order ${newDisplayOrder} is already taken by another main category.`);
        return;
      }
      // Update existing
      await supabase.from('categories').update({ name: newName, icon_name: "none", display_order: newDisplayOrder }).eq('id', editingCatId);
      if (selectedCatName === categories.find(c => c.id === editingCatId)?.name) {
        setSelectedCatName(newName);
      }
    } else {
      // Check for duplicate display order
      const isDuplicate = categories.some(c => c.display_order === newDisplayOrder);
      if (isDuplicate) {
        setCatError(`Display order ${newDisplayOrder} is already taken by another main category.`);
        return;
      }
      // Add new
      await supabase.from('categories').insert({ name: newName, icon_name: "none", count: 0, display_order: newDisplayOrder });
    }

    await fetchCategories();
    setNewName("");
    setNewDisplayOrder(categories.length + 1);
    setCatError(null);
    setIsAddModalOpen(false);
    setEditingCatId(null);
  };

  const confirmDelete = async () => {
    if (!deletingCat) return;
    await supabase.from('categories').delete().eq('id', deletingCat.id);
    await fetchCategories();
    setIsDeleteModalOpen(false);
    setDeletingCat(null);
  };

  const handleAddSubcategory = async () => {
    if (!newSubName) return;
    const cat = categories.find(c => c.name === selectedCatName);
    if (!cat) return;

    if (newSubDisplayOrder < 1) {
      setSubError("Order must be 1 or greater.");
      return;
    }

    // Check for duplicate display order in the same category
    const currentSubs = subcategories[selectedCatName] || [];
    const isDuplicate = currentSubs.some(s => s.display_order === newSubDisplayOrder);
    if (isDuplicate) {
      setSubError(`Order ${newSubDisplayOrder} is taken.`);
      return;
    }

    await supabase.from('subcategories').insert({
      category_id: cat.id,
      name: newSubName,
      count: 0,
      display_order: newSubDisplayOrder
    });

    await fetchCategories();
    setNewSubName("");
    setNewSubDisplayOrder(1);
    setSubError(null);
  };

  const handleDeleteSubcategory = async (subId: string) => {
    await supabase.from('subcategories').delete().eq('id', subId);
    await fetchCategories();
  };

  const handleOpenEditSubModal = (sub: any) => {
    setEditingSub(sub);
    setEditSubName(sub.name);
    setEditSubDisplayOrder(sub.display_order || 0);
    setEditSubError(null);
    setIsEditSubModalOpen(true);
  };

  const handleSaveSubcategory = async () => {
    if (editSubDisplayOrder < 1) {
      setEditSubError("Display order must be 1 or greater.");
      return;
    }

    // Check for duplicate display order (excluding self)
    const currentSubs = subcategories[selectedCatName] || [];
    const isDuplicate = currentSubs.some(s => s.display_order === editSubDisplayOrder && s.id !== editingSub.id);
    if (isDuplicate) {
      setEditSubError(`Display order ${editSubDisplayOrder} is already taken.`);
      return;
    }
    
    await supabase.from('subcategories').update({ name: editSubName, display_order: editSubDisplayOrder }).eq('id', editingSub.id);
    await fetchCategories();
    
    setIsEditSubModalOpen(false);
    setEditingSub(null);
    setEditSubError(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-primary">Categories</h2>
        <button 
          onClick={handleOpenAddModal}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Main Category
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel - Main Categories */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-[10px] font-bold text-text-muted tracking-widest uppercase ml-1">Main Categories</h3>
          <div className="card p-2 space-y-1">
            {categories.map((cat) => {
              const isActive = selectedCatName === cat.name;
              
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCatName(cat.name)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl transition-all group cursor-pointer relative h-[72px]",
                    isActive ? "bg-brand-gold-light text-brand-gold shadow-sm" : "hover:bg-gray-50 text-text-secondary"
                  )}
                >
                  <div className="w-8 h-8 rounded bg-white flex items-center justify-center font-mono text-[10px] font-bold text-text-muted border border-gray-100 shrink-0">
                    {cat.display_order}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold">{cat.name}</p>
                    <p className={cn(
                      "text-[10px] font-bold uppercase tracking-widest mt-0.5",
                      isActive ? "text-brand-gold/70" : "text-text-muted"
                    )}>{cat.count} Products</p>
                  </div>
                  
                  {/* Action Buttons on Hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleEditClick(e, cat)}
                      className="p-1.5 hover:bg-white rounded-lg transition-colors text-text-muted hover:text-brand-gold shadow-sm border border-transparent hover:border-gray-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteClick(e, cat)}
                      className="p-1.5 hover:bg-white rounded-lg transition-colors text-text-muted hover:text-danger shadow-sm border border-transparent hover:border-gray-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className={cn(
                      "w-4 h-4 transition-transform",
                      isActive ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-50"
                    )} />
                  </div>
                </div>
              );
            })}
            {categories.length === 0 && (
               <p className="text-sm text-text-muted text-center py-4">No categories found.</p>
            )}
          </div>
        </div>

        {/* Right Panel - Subcategories */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-end ml-1">
            <h3 className="text-[10px] font-bold text-text-muted tracking-widest uppercase">
              Subcategories in <span className="text-text-primary">{selectedCatName}</span>
            </h3>
            <span className="text-[10px] font-bold text-text-muted">DRAG TO REORDER</span>
          </div>
          
          <div className="card space-y-2">
            {(subcategories[selectedCatName] || []).map((sub: any, i: number) => {
              return (
                <div key={sub.id} className="space-y-2">
                  <div 
                    className="flex items-center gap-4 p-4 rounded-xl transition-all group border border-transparent bg-gray-50/50 hover:bg-white hover:border-gray-100"
                  >
                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center font-mono text-[10px] font-bold text-text-muted border border-gray-100 shrink-0">
                      {sub.display_order}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-text-primary">{sub.name}</p>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                        {sub.count} Products
                      </p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenEditSubModal(sub)}
                        className="p-2 text-text-muted hover:text-brand-gold hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSubcategory(sub.id)}
                        className="p-2 text-text-muted hover:text-danger hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="pt-4 mt-4 border-t border-gray-100">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder={`Add new subcategory to ${selectedCatName}...`}
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSubcategory()}
                  className="flex-1 px-4 py-2 bg-gray-50 border border-transparent rounded-lg text-sm outline-none focus:bg-white focus:border-brand-gold transition-all"
                />
                <input 
                  type="number" 
                  placeholder="Order"
                  value={newSubDisplayOrder}
                  onChange={(e) => {
                    setNewSubDisplayOrder(parseInt(e.target.value) || 0);
                    setSubError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSubcategory()}
                  className={cn(
                    "w-20 px-3 py-2 bg-gray-50 border rounded-lg text-sm outline-none transition-all",
                    subError ? "border-rose-500 focus:bg-white" : "border-transparent focus:bg-white focus:border-brand-gold"
                  )}
                />
                <button 
                  onClick={handleAddSubcategory}
                  className="px-4 py-2 bg-brand-sidebar text-white rounded-lg text-xs font-bold hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              {subError && <p className="text-[10px] font-bold text-rose-500 mt-2 ml-1 animate-fade-in">{subError}</p>}
            </div>
          </div>

          <div className="bg-brand-gold/5 border border-brand-gold/10 p-6 rounded-2xl flex items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
              <FolderTree className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary">Managing Hierarchy</h4>
              <p className="text-xs text-text-secondary mt-1">Changes to subcategories affect product filters and navigation on the storefront live.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Main Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-brand-sidebar/40 backdrop-blur-sm"
            onClick={() => setIsAddModalOpen(false)}
          ></div>
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary">{editingCatId ? "Edit Category" : "Add Main Category"}</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-secondary">Category Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Footwear"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-brand-gold transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-secondary">Display Order</label>
                  <input 
                    type="number" 
                    value={newDisplayOrder}
                    onChange={(e) => {
                      setNewDisplayOrder(parseInt(e.target.value) || 0);
                      setCatError(null);
                    }}
                    className={cn(
                      "w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm outline-none transition-all",
                      catError ? "border-rose-500 focus:bg-white" : "border-transparent focus:bg-white focus:border-brand-gold"
                    )}
                  />
                  {catError ? (
                    <p className="text-xs font-bold text-rose-500 animate-fade-in">{catError}</p>
                  ) : (
                    <p className="text-xs text-text-muted">Lower numbers appear first.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-text-muted hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveCategory}
                className="flex-1 px-4 py-3 bg-brand-gold text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-brand-gold/20"
              >
                {editingCatId ? "Update Category" : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-brand-sidebar/60 backdrop-blur-md"
            onClick={() => setIsDeleteModalOpen(false)}
          ></div>
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 text-center">
            <div className="p-8">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Delete Category?</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-text-primary">"{deletingCat?.name}"</span>? 
                This will also remove all associated subcategories.
              </p>
            </div>
            <div className="p-6 bg-gray-50 flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-text-muted hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-rose-500 text-white rounded-xl text-sm font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Subcategory Modal */}
      {isEditSubModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-brand-sidebar/40 backdrop-blur-sm"
            onClick={() => setIsEditSubModalOpen(false)}
          ></div>
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary">Edit Subcategory</h3>
              <button 
                onClick={() => setIsEditSubModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-secondary">Subcategory Name</label>
                <input 
                  type="text" 
                  value={editSubName}
                  onChange={(e) => setEditSubName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-brand-gold transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-secondary">Display Order</label>
                <input 
                  type="number" 
                  value={editSubDisplayOrder}
                  onChange={(e) => {
                    setEditSubDisplayOrder(parseInt(e.target.value) || 0);
                    setEditSubError(null);
                  }}
                  className={cn(
                    "w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm outline-none transition-all",
                    editSubError ? "border-rose-500 focus:bg-white" : "border-transparent focus:bg-white focus:border-brand-gold"
                  )}
                />
                {editSubError && <p className="text-xs font-bold text-rose-500 animate-fade-in">{editSubError}</p>}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button 
                onClick={() => setIsEditSubModalOpen(false)}
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-text-muted hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveSubcategory}
                className="flex-1 px-4 py-3 bg-brand-gold text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-lg"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
