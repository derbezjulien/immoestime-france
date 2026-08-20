import { createClientFromRequest } from 'npm:@base44/sdk@0.8.43';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // Suppression du compte : opération admin nécessitant le service role.
    // On ne supprime que le compte de l'utilisateur authentifié lui-même.
    await base44.asServiceRole.entities.User.delete(user.id);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}