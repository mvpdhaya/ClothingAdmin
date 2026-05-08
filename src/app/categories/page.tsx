"use client";

import { useState } from "react";
import { 
  Plus, 
  GripVertical, 
  Edit, 
  ChevronRight,
  FolderTree,
  Shirt,
  Watch,
  Zap,
  ShoppingBag,
  Heart,
  Star,
  X,
  Smartphone,
  Gem,
  Coffee,
  Trash2,
  Edit2,
  AlertTriangle
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { initialMainCategories, initialSubcategoriesData } from "@/lib/data";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const availableIcons = [
  { name: "Shirt", icon: Shirt },
  { name: "Watch", icon: Watch },
  { name: "Zap", icon: Zap },
  { name: "ShoppingBag", icon: ShoppingBag },
  { name: "Heart", icon: Heart },
  { name: "Star", icon: Star },
  { name: "Smartphone", icon: Smartphone },
  { name: "Gem", icon: Gem },
  { name: "Coffee", icon: Coffee },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(initialMainCategories);
  const [selectedCat, setSelectedCat] = useState("Clothing");
  const [subcategories, setSubcategories] = useState<any>(initialSubcategoriesData);
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [selectedIconName, setSelectedIconName] = useState("Shirt");

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCat, setDeletingCat] = useState<any>(null);

  // Subcategory State
  const [newSubName, setNewSubName] = useState("");
  const [editingSub, setEditingSub] = useState<any>(null);
  const [isEditSubModalOpen, setIsEditSubModalOpen] = useState(false);
  const [editSubName, setEditSubName] = useState("");
  const [expandedSubs, setExpandedSubs] = useState<number[]>([]);
  const [newNestedName, setNewNestedName] = useState<{ [id: number]: string }>({});

  const handleOpenAddModal = () => {
    setEditingCatId(null);
    setNewName("");
    setSelectedIconName("Shirt");
    setIsAddModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, cat: any) => {
    e.stopPropagation();
    setEditingCatId(cat.id);
    setNewName(cat.name);
    
    // Find icon name
    const iconEntry = availableIcons.find(i => i.icon === cat.icon);
    setSelectedIconName(iconEntry ? iconEntry.name : "Shirt");
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, cat: any) => {
    e.stopPropagation();
    setDeletingCat(cat);
    setIsDeleteModalOpen(true);
  };

  const handleSaveCategory = () => {
    if (!newName) return;
    
    const iconObj = availableIcons.find(i => i.name === selectedIconName) || availableIcons[0];
    
    if (editingCatId) {
      // Update existing
      setCategories(categories.map(cat => 
        cat.id === editingCatId 
          ? { ...cat, name: newName, icon: iconObj.icon } 
          : cat
      ));
      
      // Update subcategories key if name changed
      const oldName = categories.find(c => c.id === editingCatId)?.name;
      if (oldName && oldName !== newName) {
        const updatedSubs = { ...subcategories };
        updatedSubs[newName] = updatedSubs[oldName];
        delete updatedSubs[oldName];
        setSubcategories(updatedSubs);
        if (selectedCat === oldName) setSelectedCat(newName);
      }
    } else {
      // Add new
      const newCat = {
        id: Date.now(),
        name: newName,
        icon: iconObj.icon,
        count: 0,
        active: false
      };
      setCategories([...categories, newCat]);
      setSubcategories({ ...subcategories, [newName]: [] });
    }

    setNewName("");
    setIsAddModalOpen(false);
    setEditingCatId(null);
  };

  const confirmDelete = () => {
    if (!deletingCat) return;
    
    setCategories(categories.filter(c => c.id !== deletingCat.id));
    const updatedSubs = { ...subcategories };
    delete updatedSubs[deletingCat.name];
    setSubcategories(updatedSubs);
    
    if (selectedCat === deletingCat.name) {
      setSelectedCat(categories[0]?.name || "");
    }
    
    setIsDeleteModalOpen(false);
    setDeletingCat(null);
  };

  const handleAddSubcategory = () => {
    if (!newSubName) return;

    const currentSubs = subcategories[selectedCat] || [];
    const newSub = {
      id: Date.now(),
      name: newSubName,
      count: 0
    };

    setSubcategories({
      ...subcategories,
      [selectedCat]: [...currentSubs, newSub]
    });

    setNewSubName("");
  };

  const handleDeleteSubcategory = (subId: number) => {
    const currentSubs = subcategories[selectedCat] || [];
    setSubcategories({
      ...subcategories,
      [selectedCat]: currentSubs.filter((s: any) => s.id !== subId)
    });
  };

  const handleOpenEditSubModal = (sub: any) => {
    setEditingSub(sub);
    setEditSubName(sub.name);
    setIsEditSubModalOpen(true);
  };

  const handleSaveSubcategory = () => {
    if (!editSubName || !editingSub) return;
    
    const currentSubs = subcategories[selectedCat] || [];
    setSubcategories({
      ...subcategories,
      [selectedCat]: currentSubs.map((s: any) => 
        s.id === editingSub.id ? { ...s, name: editSubName } : s
      )
    });
    
    setIsEditSubModalOpen(false);
    setEditingSub(null);
  };

  const toggleSubExpansion = (subId: number) => {
    setExpandedSubs(prev => 
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  const handleAddNestedSub = (subId: number) => {
    const name = newNestedName[subId];
    if (!name) return;

    const currentSubs = subcategories[selectedCat] || [];
    setSubcategories({
      ...subcategories,
      [selectedCat]: currentSubs.map((s: any) => 
        s.id === subId 
          ? { ...s, children: [...(s.children || []), { id: Date.now(), name, count: 0 }] } 
          : s
      )
    });

    setNewNestedName({ ...newNestedName, [subId]: "" });
  };

  const handleDeleteNestedSub = (subId: number, nestedId: number) => {
    const currentSubs = subcategories[selectedCat] || [];
    setSubcategories({
      ...subcategories,
      [selectedCat]: currentSubs.map((s: any) => 
        s.id === subId 
          ? { ...s, children: (s.children || []).filter((n: any) => n.id !== nestedId) } 
          : s
      )
    });
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
              const isActive = selectedCat === cat.name;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.name)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl transition-all group cursor-pointer relative h-[72px]",
                    isActive ? "bg-brand-gold-light text-brand-gold shadow-sm" : "hover:bg-gray-50 text-text-secondary"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    isActive ? "bg-brand-gold text-white" : "bg-gray-100 group-hover:bg-white"
                  )}>
                    <cat.icon className="w-5 h-5" />
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
          </div>
        </div>

        {/* Right Panel - Subcategories */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-end ml-1">
            <h3 className="text-[10px] font-bold text-text-muted tracking-widest uppercase">
              Subcategories in <span className="text-text-primary">{selectedCat}</span>
            </h3>
            <span className="text-[10px] font-bold text-text-muted">DRAG TO REORDER</span>
          </div>
          
          <div className="card space-y-2">
            {(subcategories[selectedCat] || []).map((sub: any, i: number) => {
              const isExpanded = expandedSubs.includes(sub.id);
              return (
                <div key={sub.id} className="space-y-2">
                  <div 
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl transition-all group border border-transparent",
                      isExpanded ? "bg-white border-gray-100 shadow-sm" : "bg-gray-50/50 hover:bg-white hover:border-gray-100"
                    )}
                  >
                    <div 
                      onClick={() => toggleSubExpansion(sub.id)}
                      className="cursor-pointer text-text-muted hover:text-brand-gold transition-colors"
                    >
                      <ChevronRight className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-90 text-brand-gold")} />
                    </div>
                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center font-mono text-[10px] font-bold text-text-muted border border-gray-100">
                      {i + 1}
                    </div>
                    <div className="flex-1 cursor-pointer" onClick={() => toggleSubExpansion(sub.id)}>
                      <p className="text-sm font-bold text-text-primary">{sub.name}</p>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                        {sub.count} Products {sub.children && `· ${sub.children.length} Types`}
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

                  {/* Nested Children */}
                  {isExpanded && (
                    <div className="ml-12 space-y-2 animate-in slide-in-from-top-2 duration-200">
                      {(sub.children || []).map((nested: any) => (
                        <div key={nested.id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-transparent hover:border-gray-100 group">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                            <span className="text-sm text-text-secondary font-medium">{nested.name}</span>
                            <span className="text-[10px] font-bold text-text-muted bg-white px-1.5 py-0.5 rounded border border-gray-100">{nested.count}</span>
                          </div>
                          <button 
                            onClick={() => handleDeleteNestedSub(sub.id, nested.id)}
                            className="p-1.5 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      
                      {/* Add Nested Input */}
                      <div className="flex gap-2 p-1">
                        <input 
                          type="text" 
                          placeholder={`Add type to ${sub.name}...`}
                          value={newNestedName[sub.id] || ""}
                          onChange={(e) => setNewNestedName({ ...newNestedName, [sub.id]: e.target.value })}
                          onKeyDown={(e) => e.key === "Enter" && handleAddNestedSub(sub.id)}
                          className="flex-1 px-3 py-2 bg-white border border-gray-100 rounded-lg text-xs outline-none focus:border-brand-gold transition-all"
                        />
                        <button 
                          onClick={() => handleAddNestedSub(sub.id)}
                          className="p-2 bg-brand-sidebar text-white rounded-lg hover:brightness-110 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-4 mt-4 border-t border-gray-100">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder={`Add new subcategory to ${selectedCat}...`}
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSubcategory()}
                  className="flex-1 px-4 py-2 bg-gray-50 border border-transparent rounded-lg text-sm outline-none focus:bg-white focus:border-brand-gold transition-all"
                />
                <button 
                  onClick={handleAddSubcategory}
                  className="px-4 py-2 bg-brand-sidebar text-white rounded-lg text-xs font-bold hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
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

              <div className="space-y-3">
                <label className="text-sm font-bold text-text-secondary">Choose Icon</label>
                <div className="grid grid-cols-5 gap-3">
                  {availableIcons.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => setSelectedIconName(item.name)}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                        selectedIconName === item.name 
                          ? "bg-brand-gold text-white shadow-lg shadow-brand-gold/20 scale-110" 
                          : "bg-gray-50 text-text-muted hover:bg-gray-100"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                    </button>
                  ))}
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
