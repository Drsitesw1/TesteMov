
import { useState } from "react";
import usuariosJson from "@/data/usuarios.json";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserPlus, Edit, Trash } from "lucide-react";
import { UserFormDialog } from "./UserFormDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import { useAuth } from "@/hooks/useAuth";

export interface Usuario {
  usuario: string;
  senha: string;
  nivel: "admin" | "usuario";
  unidade: string;
}

// Garantir tipagem correta do nivel no array inicial:
const typedUsuariosJson: Usuario[] = (usuariosJson as any[]).map(u => ({
  ...u,
  nivel: u.nivel === "admin" ? "admin" : "usuario"
}));

export const UsersPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>(typedUsuariosJson);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; usuario: string | null }>({
    open: false,
    usuario: null,
  });
  const { user } = useAuth();

  // Função para criar/editar usuário (alterar o arquivo JSON):
  const handleSave = (novoUsuario: Usuario, editing: boolean) => {
    let novaLista: Usuario[];
    if (editing) {
      novaLista = usuarios.map(u =>
        u.usuario === novoUsuario.usuario ? { ...novoUsuario } : u
      );
    } else {
      // Checar duplicidade
      if (usuarios.some(u => u.usuario === novoUsuario.usuario)) {
        alert("Usuário já existe.");
        return;
      }
      novaLista = [...usuarios, novoUsuario];
    }
    setUsuarios(novaLista);
    // Salvar em arquivo (mock - em um ambiente real usaria API/backend)
    try {
      localStorage.setItem("usuarios_data", JSON.stringify(novaLista));
      // Em Lovable: apenas atualização local do array para simular persistência
    } catch (e) {
      alert("Falha ao salvar dados.");
    }
    setOpenDialog(false);
    setEditingUser(null);
  };

  // Função para deletar usuário
  const handleDelete = (usuarioToDelete: string) => {
    if (user?.usuario === usuarioToDelete && user?.nivel === "admin") {
      alert("O administrador não pode se autoexcluir.");
      setConfirmDelete({ open: false, usuario: null });
      return;
    }
    const novaLista = usuarios.filter(u => u.usuario !== usuarioToDelete);
    setUsuarios(novaLista);
    try {
      localStorage.setItem("usuarios_data", JSON.stringify(novaLista));
    } catch (e) {
      alert("Erro ao deletar usuário.");
    }
    setConfirmDelete({ open: false, usuario: null });
  };

  // Seleciona os dados do localStorage, se já editados, senão, usa o do arquivo json original:
  const dataToShow = (() => {
    const saved = localStorage.getItem("usuarios_data");
    if (saved) return JSON.parse(saved) as Usuario[];
    return usuarios;
  })();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Usuários</h1>
        <Button onClick={() => { setEditingUser(null); setOpenDialog(true); }} className="flex gap-2">
          <UserPlus className="w-4 h-4" /> Novo Usuário
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left border-b">Usuário</th>
                  <th className="p-2 text-left border-b">Nível</th>
                  <th className="p-2 text-left border-b">Unidade</th>
                  <th className="p-2 text-center border-b">Ações</th>
                </tr>
              </thead>
              <tbody>
                {dataToShow.map((usuario) => (
                  <tr key={usuario.usuario} className="even:bg-muted/50">
                    <td className="p-2">{usuario.usuario}</td>
                    <td className="p-2 capitalize">{usuario.nivel}</td>
                    <td className="p-2">{usuario.unidade}</td>
                    <td className="p-2 flex justify-center gap-3">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingUser(usuario); setOpenDialog(true); }} title="Editar">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmDelete({ open: true, usuario: usuario.usuario })}
                        title="Excluir"
                        disabled={usuario.usuario === "admin"}
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <UserFormDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        onSave={handleSave}
        usuario={editingUser}
      />
      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete({ open, usuario: null })}
        title="Excluir usuário"
        description={`Tem certeza que deseja excluir o usuário "${confirmDelete.usuario}"?`}
        onConfirm={() => {
          if (confirmDelete.usuario) handleDelete(confirmDelete.usuario);
        }}
      />
    </div>
  );
};
