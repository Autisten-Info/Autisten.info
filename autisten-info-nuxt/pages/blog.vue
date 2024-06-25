<template>
    <main>
        <div class="container">
            <div class="row">
                <h3>Blog Content</h3>
                <ContentList path="/blog" v-slot="{ list }">
                    <ul v-for="article in list" :key="article._path">
                        <li>
                            <nuxt-link :to="article._path">
                            {{ article.title }}
                            </nuxt-link>
                        </li>
                    </ul>
                </ContentList>
            </div>
        </div>
    </main>
</template>