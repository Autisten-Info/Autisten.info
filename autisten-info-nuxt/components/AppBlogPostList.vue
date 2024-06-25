<template>
<div class="container">
            <ContentList path="/blog" v-slot="{ list }">
                <div class="row gy-3 py-5">
                    <div class="col-xxl-4" v-for="article in list" :key="article._path">
                        <div class="card">
                            <div class="card-body">
                                <h4 class="card-title">{{article.title}}</h4>
                                <p class="card-text">{{article.description}}</p><button class="btn btn-primary" type="button"><nuxt-link :to="article._path">Read More</nuxt-link></button>
                            </div>
                        </div>
                    </div>
                </div>
            </ContentList>
        </div>
</template>
