'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react'

interface SEOCheck {
    name: string
    status: 'pass' | 'warning' | 'fail' | 'info'
    message: string
    recommendation?: string
}

export function SEOAudit() {
    const [checks, setChecks] = useState<SEOCheck[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const runSEOAudit = () => {
            const auditChecks: SEOCheck[] = []

            // Check title tag
            const title = document.title
            if (!title) {
                auditChecks.push({
                    name: 'Title Tag',
                    status: 'fail',
                    message: 'Missing title tag',
                    recommendation: 'Add a descriptive title tag to improve SEO'
                })
            } else if (title.length < 30) {
                auditChecks.push({
                    name: 'Title Tag',
                    status: 'warning',
                    message: `Title too short (${title.length} chars)`,
                    recommendation: 'Title should be 30-60 characters for optimal SEO'
                })
            } else if (title.length > 60) {
                auditChecks.push({
                    name: 'Title Tag',
                    status: 'warning',
                    message: `Title too long (${title.length} chars)`,
                    recommendation: 'Title should be 30-60 characters for optimal SEO'
                })
            } else {
                auditChecks.push({
                    name: 'Title Tag',
                    status: 'pass',
                    message: `Title length optimal (${title.length} chars)`
                })
            }

            // Check meta description
            const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content')
            if (!metaDescription) {
                auditChecks.push({
                    name: 'Meta Description',
                    status: 'fail',
                    message: 'Missing meta description',
                    recommendation: 'Add a compelling meta description to improve click-through rates'
                })
            } else if (metaDescription.length < 120) {
                auditChecks.push({
                    name: 'Meta Description',
                    status: 'warning',
                    message: `Description too short (${metaDescription.length} chars)`,
                    recommendation: 'Meta description should be 120-160 characters'
                })
            } else if (metaDescription.length > 160) {
                auditChecks.push({
                    name: 'Meta Description',
                    status: 'warning',
                    message: `Description too long (${metaDescription.length} chars)`,
                    recommendation: 'Meta description should be 120-160 characters'
                })
            } else {
                auditChecks.push({
                    name: 'Meta Description',
                    status: 'pass',
                    message: `Description length optimal (${metaDescription.length} chars)`
                })
            }

            // Check canonical URL
            const canonical = document.querySelector('link[rel="canonical"]')
            if (!canonical) {
                auditChecks.push({
                    name: 'Canonical URL',
                    status: 'warning',
                    message: 'Missing canonical URL',
                    recommendation: 'Add canonical URL to prevent duplicate content issues'
                })
            } else {
                auditChecks.push({
                    name: 'Canonical URL',
                    status: 'pass',
                    message: 'Canonical URL present'
                })
            }

            // Check Open Graph tags
            const ogTitle = document.querySelector('meta[property="og:title"]')
            const ogDescription = document.querySelector('meta[property="og:description"]')
            const ogImage = document.querySelector('meta[property="og:image"]')

            if (!ogTitle || !ogDescription || !ogImage) {
                auditChecks.push({
                    name: 'Open Graph Tags',
                    status: 'warning',
                    message: 'Incomplete Open Graph tags',
                    recommendation: 'Add og:title, og:description, and og:image for better social sharing'
                })
            } else {
                auditChecks.push({
                    name: 'Open Graph Tags',
                    status: 'pass',
                    message: 'Open Graph tags complete'
                })
            }

            // Check Twitter Card tags
            const twitterCard = document.querySelector('meta[name="twitter:card"]')
            if (!twitterCard) {
                auditChecks.push({
                    name: 'Twitter Cards',
                    status: 'warning',
                    message: 'Missing Twitter Card tags',
                    recommendation: 'Add Twitter Card tags for better Twitter sharing'
                })
            } else {
                auditChecks.push({
                    name: 'Twitter Cards',
                    status: 'pass',
                    message: 'Twitter Card tags present'
                })
            }

            // Check structured data
            const structuredData = document.querySelectorAll('script[type="application/ld+json"]')
            if (structuredData.length === 0) {
                auditChecks.push({
                    name: 'Structured Data',
                    status: 'warning',
                    message: 'No structured data found',
                    recommendation: 'Add JSON-LD structured data for better search results'
                })
            } else {
                auditChecks.push({
                    name: 'Structured Data',
                    status: 'pass',
                    message: `${structuredData.length} structured data blocks found`
                })
            }

            // Check heading structure
            const h1Tags = document.querySelectorAll('h1')
            if (h1Tags.length === 0) {
                auditChecks.push({
                    name: 'H1 Tag',
                    status: 'fail',
                    message: 'No H1 tag found',
                    recommendation: 'Add exactly one H1 tag per page for better SEO'
                })
            } else if (h1Tags.length > 1) {
                auditChecks.push({
                    name: 'H1 Tag',
                    status: 'warning',
                    message: `Multiple H1 tags found (${h1Tags.length})`,
                    recommendation: 'Use only one H1 tag per page'
                })
            } else {
                auditChecks.push({
                    name: 'H1 Tag',
                    status: 'pass',
                    message: 'Single H1 tag found'
                })
            }

            // Check images without alt text
            const images = document.querySelectorAll('img')
            const imagesWithoutAlt = Array.from(images).filter(img => !img.getAttribute('alt'))
            if (imagesWithoutAlt.length > 0) {
                auditChecks.push({
                    name: 'Image Alt Text',
                    status: 'warning',
                    message: `${imagesWithoutAlt.length} images missing alt text`,
                    recommendation: 'Add descriptive alt text to all images for accessibility and SEO'
                })
            } else if (images.length > 0) {
                auditChecks.push({
                    name: 'Image Alt Text',
                    status: 'pass',
                    message: 'All images have alt text'
                })
            }

            // Check viewport meta tag
            const viewport = document.querySelector('meta[name="viewport"]')
            if (!viewport) {
                auditChecks.push({
                    name: 'Viewport Meta Tag',
                    status: 'fail',
                    message: 'Missing viewport meta tag',
                    recommendation: 'Add viewport meta tag for mobile responsiveness'
                })
            } else {
                auditChecks.push({
                    name: 'Viewport Meta Tag',
                    status: 'pass',
                    message: 'Viewport meta tag present'
                })
            }

            setChecks(auditChecks)
            setLoading(false)
        }

        // Run audit after component mounts
        setTimeout(runSEOAudit, 1000)
    }, [])

    const getStatusIcon = (status: SEOCheck['status']) => {
        switch (status) {
            case 'pass':
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'warning':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />
            case 'fail':
                return <XCircle className="h-4 w-4 text-red-500" />
            case 'info':
                return <Info className="h-4 w-4 text-blue-500" />
        }
    }

    const getStatusBadge = (status: SEOCheck['status']) => {
        const variants = {
            pass: 'bg-green-100 text-green-800',
            warning: 'bg-yellow-100 text-yellow-800',
            fail: 'bg-red-100 text-red-800',
            info: 'bg-blue-100 text-blue-800'
        }

        return (
            <Badge className={variants[status]}>
                {status.toUpperCase()}
            </Badge>
        )
    }

    const passCount = checks.filter(c => c.status === 'pass').length
    const warningCount = checks.filter(c => c.status === 'warning').length
    const failCount = checks.filter(c => c.status === 'fail').length

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>SEO Audit</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Running SEO audit...</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>SEO Audit Results</CardTitle>
                <div className="flex gap-4 text-sm">
                    <span className="text-green-600">✓ {passCount} Passed</span>
                    <span className="text-yellow-600">⚠ {warningCount} Warnings</span>
                    <span className="text-red-600">✗ {failCount} Failed</span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {checks.map((check, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                            {getStatusIcon(check.status)}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium">{check.name}</h4>
                                    {getStatusBadge(check.status)}
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">{check.message}</p>
                                {check.recommendation && (
                                    <p className="text-xs text-blue-600">{check.recommendation}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}