
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { Usuario } from "./UsersPage";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (user: Usuario, editing: boolean) => void;
  usuario: Usuario | null;
}

export const UserFormDialog = ({ open, onOpenChange, onSave, usuario }: UserFormDialogProps) => {
  const [form, setForm] = useState<Usuario>(
    usuario || { usuario: "", senha: "", nivel: "usuario", unidade: "" }
  );
  const [showSenha, setShowSenha] = useState(false);

  // Atualiza campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((old) => ({
      ...old,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card max-w-md">
        <DialogHeader>
          <DialogTitle>{usuario ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (!form.usuario || !form.senha || !form.unidade) {
              alert("Preencha todos os campos.");
              return;
            }
            onSave(form, !!usuario);
          }}
          className="space-y-4 pt-2"
        >
          <div>
            <label className="block text-sm mb-1">Usuário</label>
            <Input
              name="usuario"
              value={form.usuario}
              onChange={handleChange}
              maxLength={30}
              required
              disabled={!!usuario}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Senha</label>
            <div className="relative flex items-center">
              <Input
                name="senha"
                type={showSenha ? "text" : "password"}
                value={form.senha}
                onChange={handleChange}
                maxLength={24}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1 text-muted-foreground"
                onClick={() => setShowSenha((v) => !v)}
                tabIndex={-1}
              >
                {showSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Unidade</label>
            <Input
              name="unidade"
              value={form.unidade}
              onChange={handleChange}
              maxLength={30}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Nível</label>
            <select
              name="nivel"
              value={form.nivel}
              onChange={handleChange}
              className="bg-input border-border rounded px-2 py-1 w-full"
              required
            >
              <option value="usuario">Usuário</option>
              <option value="admin" disabled={!!usuario}>Admin</option>
            </select>
          </div>
          <DialogFooter className="pt-4 flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{usuario ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
