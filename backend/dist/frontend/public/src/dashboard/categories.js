var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { api } from './api.js';
import { $ } from './domUtils.js';
export function fetchCategories() {
    return __awaiter(this, void 0, void 0, function* () {
        const categories = yield api('/api/categories');
        const categoriesList = $('categoriesList');
        if (categoriesList) {
            categoriesList.innerHTML = categories.map(cat => `<li style="margin-bottom: 0.7em;">
                <span>${cat.id}: ${cat.name}</span>
                <div style="display: flex; flex-direction: row; gap: 0.5em; margin-top: 0.2em;">
                    ${cat.name.toLowerCase() !== 'necategorizate' ? `<button style="width: 110px;" onclick="deleteCategory(${cat.id})">Șterge</button>` : ''}
                    <button style="width: 110px;" onclick="editCategory(${cat.id}, '${cat.name.replace(/'/g, "\\'")}')">Editează</button>
                </div>
            </li>`).join('');
        }
        const itemCategory = $('itemCategory');
        if (itemCategory) {
            itemCategory.innerHTML = categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
        }
    });
}
export function setupCategoryForm() {
    var _a;
    (_a = $('categoryForm')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', function (e) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            e.preventDefault();
            const name = (_a = $('categoryName')) === null || _a === void 0 ? void 0 : _a.value;
            if (name) {
                yield api('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
                this.reset();
                fetchCategories();
            }
        });
    });
}
