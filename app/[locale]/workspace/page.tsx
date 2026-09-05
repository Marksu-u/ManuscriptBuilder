import ManuscriptWorkspace from '@/components/manuscript-workspace';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const{locale}=await params;const t=await getTranslations({locale,namespace:'workspace'});return{title:t('metaTitle'),description:t('metaDescription'),alternates:{canonical:'/workspace'},openGraph:{url:'/workspace'}};}
export default async function WorkspacePage({params}:{params:Promise<{locale:string}>}){const{locale}=await params;setRequestLocale(locale);return <ManuscriptWorkspace/>;}
