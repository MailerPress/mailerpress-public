<?php

declare(strict_types=1);

namespace MailerPress\Core;

\defined('ABSPATH') || exit;

final class HtmlParser
{
    private $htmlContent;
    private $variables;

    /**
     * Définit les variables dynamiques à remplacer.
     *
     * @param array $variables tableau associatif des variables dynamiques et leurs valeurs
     */
    public function init(string $htmlContent, array $variables): static
    {
        $this->htmlContent = $htmlContent;
        $this->variables = $variables;

        return $this;
    }

    /**
     * Remplace les variables dynamiques dans le contenu HTML.
     *
     * @return string le contenu HTML avec les variables remplacées par leurs valeurs
     */
    public function replaceVariables(): string
    {
        $replacedContent = $this->htmlContent;

        foreach ($this->variables as $key => $value) {
            // Replace %VAR% format
            $patternPercent = \sprintf('/%%%s%%/', preg_quote($key, '/'));
            $replacedContent = preg_replace($patternPercent, $value, $replacedContent);

            // Replace {{subscriber.name}} format
            $patternBraces = \sprintf('/{{\s*%s\s*}}/', preg_quote($key, '/'));
            $replacedContent = preg_replace($patternBraces, $value, $replacedContent);
        }

        return $replacedContent;
    }
}
