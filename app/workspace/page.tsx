import ManuscriptWorkspace from '@/components/manuscript-workspace';
import { pageMetadata } from '@/lib/site';
export const metadata=pageMetadata({title:'Free handout editor · Manuscript Builder',description:'Create letters, grimoires and datapads in your browser. No account required.',path:'/workspace'});
export default function WorkspacePage(){return <ManuscriptWorkspace/>;}
